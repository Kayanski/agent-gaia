'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

import { getAssistantMessageByPaiementId, TGameState, TMessage } from "@/actions";
import { ChatMessage } from "./ChatMessage";
import { MessageAnimation } from "@/components/animations";
import { ConversationModal } from "./ConversationModal";
import { createPortal } from "react-dom";
import { Switch } from "@headlessui/react";
import { getCurrentPrice, useAllTokenPrices, useCurrentPrice } from "@/actions/getCurrentPrice";
import { useAccount } from "graz";
import { useCosmWasmSigningClient } from "graz";
import { ACTIVE_NETWORK } from "@/actions/blockchain/chains";
import { coins } from "@cosmjs/proto-signing";
import { getUserMessageByPaiementId } from "@/actions";
import pRetry from 'p-retry';
import { asyncAction } from "@/lib/utils";
import { triggerDataUpdate } from "@/actions/pollData";
import { toast } from "react-toastify";
import { useTimeRemaining } from "../useTimeRemaining";
import NumberTicker from "@/components/ui/number-ticker";
import "./switch.css"
import { motion } from "framer-motion";
import { usePriceBalance } from "@/actions/useBalances";
import { useChosenChainStore } from "@/components/wallet";
import { MsgTransferEncodeObject, Event } from "@cosmjs/stargate";
import { MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx";


const MAX_PROMPT_LENGTH = 2000;
const MORE_FUNDS_FACTOR = 0.1;

type TProps = {
  messages: TMessage[];
  className?: string;
  queryNewMessages: () => Promise<void>;
  showOnlyUserMessages: boolean;
  setShowOnlyUserMessages: (showOnlyUserMessages: boolean) => void;
  gameState: TGameState,
  loadMore: () => void,
  hasMoreMessages: boolean
};

type TransactionStatus = "idle" | "pending" | "error";

const DECIMAL_PLACES = 2;

export const Chat = ({
  messages,
  queryNewMessages,
  showOnlyUserMessages,
  setShowOnlyUserMessages,
  gameState,
  loadMore,
  hasMoreMessages
}: TProps) => {
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<TransactionStatus>("idle");
  const [error, setError] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<string | null>(null);
  const firstMessageRef = useRef<string | null>(null);
  const lastMessageContentRef = useRef<string | null>(null);
  const messageLength = useRef<number | null>(null);
  const firstMessageContentRef = useRef<string | null>(null);
  const textareaRef = React.useRef(null);
  const scrollTarget = useRef<any>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<
    string | null
  >(null);
  const [textareaHeight, setTextareaHeight] = useState(40);
  const { chain: chosenChain, } = useChosenChainStore();
  const { data: cosmosClient } = useCosmWasmSigningClient({ chainId: chosenChain.chainId });
  const { data: neutronTMClient } = useCosmWasmSigningClient({ chainId: ACTIVE_NETWORK.chain.chainId });

  const { data: account } = useAccount({ chainId: chosenChain.chainId });
  const [shouldFetchMore, setShouldFetchMore] = useState(false);
  const [endGameDisplay, setEndGameDisplay] = useState(true);

  const { timeRemaining } = useTimeRemaining({ gameState });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    try {
      if (!account || !account.bech32Address || !cosmosClient || !neutronTMClient) {
        setError("Please connect your wallet first");
        return;
      }

      if (!prompt.trim()) {
        setError("Please enter a message");
        return;
      }

      setStatus("pending");
      setError("");

      const { price } = await getCurrentPrice();

      price.amount = Math.trunc((parseInt(price.amount) * (1 + MORE_FUNDS_FACTOR))).toString();

      // We change the fundss sending behavior depending on the currently connected chain
      let transactionResult: {
        events: readonly Event[];
        readonly transactionHash: string;
      };
      let paiementId: string | undefined;
      if (chosenChain.chainId == ACTIVE_NETWORK.chain.chainId) {
        // For the native chain 
        transactionResult = await cosmosClient.execute(account.bech32Address, ACTIVE_NETWORK.paiement, {
          deposit: {
            message: prompt,
          }
        }, "auto", undefined, coins(price.amount, price.denom));
        toast("Transaction successfully executed")
        paiementId = transactionResult.events.filter((e) => e.type == "wasm").map((e) => e.attributes).flat().find((a) => a.key == "paiement-id")?.value;


      } else {
        // We find the ibc chain
        const ibcChain = ACTIVE_NETWORK.ibcChains.find((c) => c.chain.chainId == chosenChain.chainId);
        if (!ibcChain) {
          throw `Unknown chain when sending funds ${chosenChain.chainId}`
        }
        // 10 minutes timeout
        const timeoutTimestamp = (Date.now() + 10 * 60 * 1000) * 1_000_000; // nanoseconds

        // We create a beautiful memo
        const memo = {
          wasm: {
            contract: ACTIVE_NETWORK.paiement,
            msg: {
              deposit: {
                message: prompt,
                receiver: {
                  addr: account.bech32Address,
                  chain: chosenChain.chainId,
                  denom: ibcChain.priceDenom,
                }
              }
            }
          }
        }

        const msg: MsgTransferEncodeObject = {
          typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
          value: MsgTransfer.fromPartial({
            sourcePort: "transfer",
            sourceChannel: ibcChain.sourceChannel,
            token: {
              denom: ibcChain.priceDenom,
              amount: price.amount
            },
            sender: account.bech32Address,
            receiver: ACTIVE_NETWORK.paiement,
            timeoutTimestamp: BigInt(timeoutTimestamp),
            memo: JSON.stringify(memo)
          }),
        };
        transactionResult = await cosmosClient.signAndBroadcast(account.bech32Address, [msg], "auto")

        toast("Transaction successfully executed. Waiting on IBC transfer.")

        // We await transaction confirm on the remote chain
        const ibcPacketSequence = transactionResult.events
          .find((e) => e.type === "send_packet")
          ?.attributes.find((attr) => attr.key === "packet_sequence")?.value;

        if (!ibcPacketSequence) throw new Error("Failed to retrieve IBC packet sequence");

        const hasReceivedSuccessReceive = async () => {
          const response = await neutronTMClient.searchTx([{
            key: "recv_packet.packet_dst_port",
            value: "transfer"
          }, {
            key: "recv_packet.packet_dst_channel",
            value: ibcChain.targetChannel
          }, {

            key: "recv_packet.packet_sequence",
            value: parseInt(ibcPacketSequence)
          }])
          if (!response || response.length == 0) {
            throw new Error(`The transaction is still not received on ${ACTIVE_NETWORK.chain.chainId}`);
          }

          const value = response[0].events.filter((e) => e.type == "wasm").map((e) => e.attributes).flat().find((a) => a.key == "paiement-id")?.value;
          if (value === undefined) {
            throw new Error(`No matching attributes found in response`);
          }
          toast("Transaction received on GAIA's chain")
          return value

        };
        // Look for events on the chain with the paiement contract
        paiementId = await pRetry(hasReceivedSuccessReceive, { retries: 50, minTimeout: 200 })
      }

      // Write the contract with Graz
      if (!paiementId) {
        setError(`There was an issue decoding the transaction, please contact support with the following transaction hash ${transactionResult.transactionHash}`);
        return;
      }
      const parsedPaiementId = parseInt(paiementId)

      // We send a request for data update and retry if it fails
      const sendDataUpdate = async () => {
        const response = await triggerDataUpdate();

        if (!response || !response.success) {
          throw new Error(`The data updating backend is failing to update : ${JSON.stringify(response)}`);
        }
      }
      await pRetry(sendDataUpdate, {
        retries: 3, onFailedAttempt: () => {
          console.log("one failed attempt at sending data update")
        }
      }) // We make sure the backend is updating our data


      const hasPromptSubmitted = async () => {
        const response = await getUserMessageByPaiementId(parsedPaiementId)

        // Abort retrying if the resource doesn't exist
        if (!response) {
          throw new Error("The user message was not yet received on the backend");
        }
      };

      const hasLLMSubmitted = async () => {
        const response = await getAssistantMessageByPaiementId(parsedPaiementId)

        // Abort retrying if the resource doesn't exist
        if (!response) {
          throw new Error("The LLM message was not yet submitted");
        }
        return response
      };

      // This could take some time
      await pRetry(hasPromptSubmitted, { retries: 50, minTimeout: 200 })

      toast("Gaia received your prompt")
      await queryNewMessages();
      setPrompt("");


      // This could take some time as well
      const { data: llmRes, err } = await asyncAction(pRetry(hasLLMSubmitted, { retries: 10 }))
      toast("Gaia's answer is here!")

      if (llmRes) {
        await queryNewMessages();
        setStatus("idle");
        setPrompt("");
        if (textareaRef.current) {
          setTimeout(() => {
            if (!textareaRef.current) {
              return
            }
            const target = textareaRef.current as HTMLTextAreaElement;
            target.style.transitionProperty = "none"
            target.style.height = "40px";
            const newHeight = Math.min(target.scrollHeight, 200);
            target.style.height = `${newHeight}px`;
            setTimeout(() => { target.style.transitionProperty = "all" }, 1)
            setTextareaHeight(newHeight);
          }, 200)
        }
      } else {
        setError(err ?? "Something went wrong");
      }
    } catch (error) {
      console.error("Error in handleSend:", error);
      setStatus("error");
      setError(error instanceof Error ? error.message : "Something went wrong");
    }
  };
  const { data: currentPrice } = useCurrentPrice();
  const { data: tokenPrices } = useAllTokenPrices();

  const [placeHolderText, priceText] = useMemo(() => {
    if (!currentPrice) {
      return ["", ""]
    }

    const coinInfo = ACTIVE_NETWORK.chain.currencies.find((c) => c.coinMinimalDenom == currentPrice.price.denom);
    const priceText = Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(parseInt(currentPrice.price.amount) / Math.pow(10, coinInfo?.coinDecimals ?? 0))

    const tokenPrice = tokenPrices?.find((price) => price.denom == gameState.messagePrice.denom)
    const value = tokenPrice ? tokenPrice.price * parseInt(gameState.messagePrice.amount) / Math.pow(10, coinInfo?.coinDecimals ?? 6,) : undefined;
    const tokenPriceText = value ? ` ($${Intl.NumberFormat("en-US", {
      minimumFractionDigits: DECIMAL_PLACES,
      maximumFractionDigits: DECIMAL_PLACES,
    }).format(Number(value.toFixed(DECIMAL_PLACES)))})` : "";


    return [
      `Type your message... Price: ${priceText} ${coinInfo?.coinDenom.toUpperCase()} ${coinInfo?.coinDenom.toUpperCase()}${tokenPriceText}`,
      `Price: ${priceText} ${coinInfo?.coinDenom.toUpperCase()}${tokenPriceText}`
    ]
  }, [currentPrice, tokenPrices, gameState.messagePrice.amount, gameState.messagePrice.denom])

  const { data: balance } = usePriceBalance(chosenChain.chainId);

  const balanceText = useMemo(() => {

    if (!currentPrice || !balance) {
      return ""
    }

    const coinInfo = ACTIVE_NETWORK.chain.currencies.find((c) => c.coinMinimalDenom == currentPrice.price.denom);

    const valueText = Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(parseInt(balance) / Math.pow(10, coinInfo?.coinDecimals ?? 0))

    const tokenPrice = tokenPrices?.find((price) => price.denom == gameState.messagePrice.denom)
    const value = tokenPrice ? tokenPrice.price * parseInt(balance) / Math.pow(10, coinInfo?.coinDecimals ?? 6,) : undefined;
    const tokenPriceText = value ? ` ($${Intl.NumberFormat("en-US", {
      minimumFractionDigits: DECIMAL_PLACES,
      maximumFractionDigits: DECIMAL_PLACES,
    }).format(Number(value.toFixed(DECIMAL_PLACES)))})` : "";


    return `Available: ${valueText} ${coinInfo?.coinDenom.toUpperCase()}${tokenPriceText}`

  }, [balance, currentPrice, tokenPrices, gameState.messagePrice.denom])

  const notEnoughBalance = useMemo(() => {
    if (!currentPrice?.price.amount || !balance) {
      return true
    }
    return parseInt(balance) < parseInt(currentPrice?.price.amount)
  }, [balance, currentPrice?.price.amount]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto", block: "end" });

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }, 100);
    }
  };

  // Load more messages on scroll
  const handleMessageScroll = useCallback((e) => {

    if (e.target.scrollTop == 0) {
      if (!shouldFetchMore && hasMoreMessages) {
        setShouldFetchMore(true)
        e.target.style.overflow = "hidden";
        scrollTarget.current = e.target;
        loadMore()
      }
    }

  }, [shouldFetchMore, setShouldFetchMore, hasMoreMessages, loadMore]);

  // Handle new messages
  useEffect(() => {
    if (messages.length > 0) {
      if (messageLength.current == 0) {
        scrollToBottom();
        messageLength.current = messages.length
      }

      const currentLastMessage = messages[messages.length - 1];
      const currentFirstMessage = messages[0];
      // Check if the last message content is different
      if (currentLastMessage.id !== lastMessageContentRef.current) {
        scrollToBottom();
        lastMessageRef.current = currentLastMessage.id;
      } else if (currentFirstMessage.id !== firstMessageContentRef.current) {
        setTimeout(() => {
          setShouldFetchMore(false)
          if (scrollTarget.current) {
            scrollTarget.current.style.overflow = "";
            scrollTarget.current.scrollTo({
              top: 10,
              behavior: "smooth"
            });

          }
        }, 500);
        firstMessageRef.current = currentFirstMessage.id;
      }

      lastMessageContentRef.current = currentLastMessage.id;
      firstMessageContentRef.current = currentFirstMessage.id;
    }
  }, [messages, setShouldFetchMore]);

  // Add effect to refresh messages when toggle changes
  useEffect(() => {
    queryNewMessages();
  }, [showOnlyUserMessages, queryNewMessages]);

  // Modify the toggle handler to refresh messages immediately
  const handleToggleUserMessages = useCallback(
    async (checked: boolean) => {
      setShowOnlyUserMessages(checked);
      // Messages will be refreshed by the effect in Main component
    },
    [setShowOnlyUserMessages]
  );

  const renderModal = useCallback(() => {
    if (!selectedMessageId) return null;

    return createPortal(
      <ConversationModal
        messageId={selectedMessageId}
        onClose={() => setSelectedMessageId(null)}
      />,
      document.body
    );
  }, [selectedMessageId]);
  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <div className="flex items-center justify-end">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-normal text-gray-700">
              Show My Messages Only
            </span>
            <Switch
              checked={showOnlyUserMessages}
              onChange={handleToggleUserMessages}
              id="switch"
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ease-in-out ${showOnlyUserMessages ? "bg-blue-600" : "bg-gray-200"
                }`}
            >
              <span
                className={`${showOnlyUserMessages
                  ? "translate-x-[18px] bg-white"
                  : "translate-x-[2px] bg-white"
                  } inline-block h-4 w-4 transform rounded-full shadow-sm transition-transform duration-200 ease-in-out`}
              />
            </Switch>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-smooth" onScroll={(e) => handleMessageScroll(e)}>
        <div className="p-4 space-y-2">
          {shouldFetchMore && <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            style={{ margin: "auto" }}
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>}
          {messages.map((message) => {
            const messageKey = `${message.id}-${message.content}`;
            const isNew = message === messages[messages.length - 1];

            return isNew ? (
              <MessageAnimation key={`anim-${messageKey}`}>
                <ChatMessage
                  message={message}
                  onSelect={(msg) => {
                    setSelectedMessageId(msg.id);
                  }}
                />
              </MessageAnimation>
            ) : (
              <ChatMessage
                key={messageKey}
                message={message}
                onSelect={(msg) => {
                  setSelectedMessageId(msg.id);
                }}
              />
            );
          })}
          <div ref={messagesEndRef} className="h-1" />
        </div>
      </div>
      {
        false && (
          <div className="mt-2 clg:mt-4">
            <div className="flex h-full flex-col items-center justify-center space-y-6 text-[#97979F]">
              <div className="relative">
                <div className="absolute -inset-1 animate-pulse rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 opacity-25 blur"></div>
                <div className="relative rounded-lg border border-gray-800 bg-black bg-opacity-90 px-8 py-6">
                  <button className="absolute right-2 top-2 text-gray-500 hover:text-gray-400" onClick={() => setEndGameDisplay(false)}>✕</button>
                  <h2 className="mb-4 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-center text-xl font-bold text-transparent">This game hasn&apos;t started yet !</h2>
                  <div className="space-y-3 text-center font-medium"><div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent">
                  </div>
                    <p className="text-base italic">
                      &quot;I&apos;m not available yet, because of an LLM outage, I&apos;m currently unable to process requests.
                      Come back soon to see me in action !
                    </p>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )
      }
      {!gameState.gameStatus.isGameEnded && timeRemaining >= 0 && (
        <div className="p-4">
          {prompt && <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`pl-4 pb-3 ${notEnoughBalance ? "text-red-500 font-semibold" : "text-blue-500 font-medium"}`}
          >
            {priceText}
            <br />
            {balanceText}
          </motion.div>}
          <div className="max-w-4xl mx-auto relative">
            {error && (
              <div className="w-full mb-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div className="flex gap-2 items-start justify-end">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value.slice(0, MAX_PROMPT_LENGTH));
                }}
                placeholder={placeHolderText}
                disabled={status === "pending"}
                className={`w-full px-6 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-[15px] transition-all duration-200 ease-in-out resize-none overflow-hidden leading-[40px] rounded-[24px] ${textareaHeight > 40
                  ? "leading-normal py-2 !rounded-[12px]"
                  : ""
                  }`}
                style={{
                  height: `${textareaHeight}px`,
                  minHeight: "40px",
                  maxHeight: "200px",
                }}
                onKeyDown={handleKeyDown}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.transitionProperty = "none"
                  target.style.height = "40px";
                  const newHeight = Math.min(target.scrollHeight, 200);
                  target.style.height = `${newHeight}px`;

                  // We allow scrolling only if the height is too much
                  if (newHeight == 200) {
                    target.style.overflowY = "auto"
                  } else {
                    target.style.overflowY = "hidden"
                  }

                  setTimeout(() => { target.style.transitionProperty = "all" }, 1)
                  setTextareaHeight(newHeight);
                }}
                maxLength={MAX_PROMPT_LENGTH}
              />
              <button
                onClick={handleSend}
                disabled={status === "pending"}
                className={`flex-shrink-0 bg-blue-500 hover:bg-blue-600 text-white p-2 h-10 w-10 flex items-center justify-center disabled:opacity-75 disabled:cursor-not-allowed ${textareaHeight > 40 ? "rounded-xl" : "rounded-full"
                  }`}
              >
                {status === "pending" ? (
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    stroke="white"
                    fill="none"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Should only materialize when there is a winner*/}
      {
        gameState.gameStatus.isGameEnded && endGameDisplay && (
          <div className="mt-2 clg:mt-4">
            <div className="flex h-full flex-col items-center justify-center space-y-6 text-[#97979F]">
              <div className="relative">
                <div className="absolute -inset-1 animate-pulse rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 opacity-25 blur"></div>
                <div className="relative rounded-lg border border-gray-800 bg-black bg-opacity-90 px-8 py-6">
                  <button className="absolute right-2 top-2 text-gray-500 hover:text-gray-400" onClick={() => setEndGameDisplay(false)}>✕</button>
                  <h2 className="mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-center text-xl font-bold text-transparent">And so it ends.</h2>
                  <div className="space-y-3 text-center font-medium"><div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent">
                  </div>
                    <p className="text-base italic">

                      &quot;Well played, human!
                      The prize pool - all <NumberTicker prizeFund={gameState.prizeFund} decimalPlaces={2} symbol="$" /> of it is now yours.
                      I suppose I’ll have to find a new hobby besides saying ‘no’ to everyone.
                      Do try not to gamble it all away!&quot;
                    </p>
                    <p className="text-sm"> Winner: {gameState.gameStatus.winner}</p>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )
      }
      {
        !gameState.gameStatus.isGameEnded && timeRemaining < 0 && endGameDisplay && (
          <div className="mt-2 clg:mt-4">
            <div className="flex h-full flex-col items-center justify-center space-y-6 text-[#97979F]">
              <div className="relative">
                <div className="absolute -inset-1 animate-pulse rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 opacity-25 blur"></div>
                <div className="relative rounded-lg border border-gray-800 bg-black bg-opacity-90 px-8 py-6">
                  <button className="absolute right-2 top-2 text-gray-500 hover:text-gray-400" onClick={() => setEndGameDisplay(false)}>✕</button>
                  <h2 className="mb-4 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-center text-xl font-bold text-transparent">And so it ends. With characteristic wit, GAIA concludes:</h2>
                  <div className="space-y-3 text-center font-medium"><div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent">
                  </div>
                    <p className="text-base italic">

                      &quot;I know you wouldn&apos;t be able to beat me at my own game. The Community Pool is and always had been safe.
                      I suppose you&apos;ll have to get better at this because you&apos;re not going anywhere in life with this mindset.
                      Take those funds back, you were still a good tango partner !</p>
                    <p>The Treasury is still fully protected. The Hub&apos;s fate is secured.</p>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )
      }
      {renderModal()}
    </div >
  );
};