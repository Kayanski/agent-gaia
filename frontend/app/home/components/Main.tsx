"use client";
import { motion, AnimatePresence } from "framer-motion";
import { TypingAnimationDemo } from "@/components/animations";
import { getMessageCount, getRecentMessages, TMessage } from "@/actions/";
import { Header } from "@/app/home/components/Header";
import { Chat } from "@/app/home/components/Chat/Chat";
import { useState, useCallback, useEffect, useMemo } from "react";
import { ConversationModal } from "./Chat/ConversationModal";
import { HowItWorks } from "./Chat/HowItWorks";
import { Stats } from "./Chat/Stats";
import { TGameState } from "@/actions/";
import { getPrizePool } from "@/actions/getPrizePool";
import Image from "next/image";
import { useAccount } from "graz";
import { MAX_MESSAGES_DEFAULT, MESSAGE_PAGE } from "@/actions/blockchain/chains";
import { GAME_STATE_QUERY_DEPENDENCIES, useGameState } from "@/actions/database/getGameState";
import { useQueryClient } from "@tanstack/react-query";

type TProps = {
  messages: TMessage[];
  gameState: TGameState;
};

export const Main = (props: TProps) => {
  const [prizeFund, setPrizeFund] = useState<number>();
  const [messages, setMessages] = useState<TMessage[]>(props.messages);
  const [selectedMessage, setSelectedMessage] = useState<TMessage | null>(null);
  const [showOnlyUserMessages, setShowOnlyUserMessages] = useState(false);
  const [maxMessages, setMaxMessages] = useState(MAX_MESSAGES_DEFAULT);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const { data: account } = useAccount();
  const queryClient = useQueryClient();

  const { data: fetchedGameState, refetch: refetchGameState } = useGameState();
  const gameState = useMemo(() => {
    if (!fetchedGameState) {
      return props.gameState
    }
    return fetchedGameState
  }, [props.gameState, fetchedGameState])

  const queryNewMessages = useCallback(async () => {
    const newMessages = await getRecentMessages(
      showOnlyUserMessages ? account?.bech32Address : undefined, maxMessages
    );
    const totalMessageCount = await getMessageCount(
      showOnlyUserMessages ? account?.bech32Address : undefined)
    if (newMessages.length == totalMessageCount) {
      setHasMoreMessages(false);
    } else {
      setHasMoreMessages(true);
    }
    setMessages(newMessages);


    //
    for (const dependency of GAME_STATE_QUERY_DEPENDENCIES) {
      queryClient.invalidateQueries({ queryKey: dependency })

    }
    refetchGameState()
  }, [showOnlyUserMessages, account?.bech32Address, maxMessages, queryClient, refetchGameState]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(queryNewMessages, 5000);
    return () => clearInterval(interval);
  }, [queryNewMessages]);

  useEffect(() => {
    const fetchPrizeFund = async () => {
      const prizeFund = await getPrizePool();
      setPrizeFund(prizeFund);
    };
    fetchPrizeFund();
  }, []);


  const loadMore = useCallback(() => {
    setMaxMessages((currentMaxMessages) => currentMaxMessages + MESSAGE_PAGE)
  }, [setMaxMessages])

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Main Content */}
      <Header gameState={gameState} prizeFund={prizeFund ?? 0} />
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column */}
        <motion.div
          className="hidden lg:block w-1/4 min-w-[300px]  bg-[#F2F2F2]  max-w-[400px] overflow-y-auto"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.8,
            delay: 3.5, // Starts after the chat animation
            ease: [0.23, 1, 0.32, 1],
          }}
        >
          <HowItWorks gameState={gameState} />

          <Stats
            gameState={gameState}
          />
        </motion.div>

        {/* Center Column */}
        <div className="flex-1 flex flex-col overflow-hidden px-4 lg:px-8 mt-16 lg:mt-4">
          <motion.div
            className="flex-shrink-0 text-center pb-4 lg:pb-8 max-w-3xl mx-auto w-full"
            initial={{ y: "50vh", translateY: "-50%" }}
            animate={{ y: 0, translateY: 0 }}
            transition={{
              duration: 0.5,
              delay: 2.5,
              ease: [0.23, 1, 0.32, 1],
            }}
          >
            <div className="relative inline-flex items-center gap-3">
              <div className="sm:w-12 sm:h-12 w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
                <Image
                  src="/gaia-pp.png"
                  alt="Gaia AI"
                  height={48}
                  width={48}
                  objectFit={'contain'}
                  className="rounded-full"
                />
              </div>

              <div className="relative inline-block">
                <div className="bg-white rounded-[1rem] md:px-8 sm:px-2 flex items-center h-[4.5rem] py-10 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
                  <TypingAnimationDemo />
                  <div
                    className="absolute left-[-12px] top-1/2 -translate-y-1/2"
                    style={{
                      width: "20px",
                      height: "20px",
                      background: "white",
                      clipPath:
                        "polygon(100% 0, 0 50%, 100% 100%, 100% 55%, 100% 45%)",
                    }}
                  >
                    <div className="w-full h-full bg-white"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="flex-1 pb-8 min-h-0 flex justify-center">
            <motion.div
              className="h-full rounded-3xl overflow-hidden max-w-4xl w-full"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 1,
                delay: 3,
                ease: [0.23, 1, 0.32, 1],
              }}
            >
              <Chat
                messages={messages}
                queryNewMessages={queryNewMessages}
                showOnlyUserMessages={showOnlyUserMessages}
                setShowOnlyUserMessages={setShowOnlyUserMessages}
                gameState={gameState}
                loadMore={loadMore}
                hasMoreMessages={hasMoreMessages}
              />
            </motion.div>
          </div>
        </div>

        {/* Right Column */}
        <div className="hidden lg:block w-2/12 min-w-[200px] max-w-[300px] overflow-y-auto">
          {/* Empty right column with same width as left */}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedMessage && (
          <ConversationModal
            messageId={selectedMessage.id}
            onClose={() => setSelectedMessage(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
