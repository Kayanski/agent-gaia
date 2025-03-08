import { useCallback, useState } from "react";
import { skipClient } from "./client";
import { ACTIVE_NETWORK } from "@/actions/blockchain/chains";
import { useCurrentPrice } from "@/actions/getCurrentPrice";
import { MORE_FUNDS_FACTOR } from "../home/components/Chat/Chat";
import { useAccount, useConnect } from "graz";
import { PostHandler, RouteResponse, UserAddress } from "@skip-go/client";
import { skip } from "node:test";

export interface SkipRouteArgs {
    sourceAssetDenom: string,
    sourceAssetChainID: string,
}

export interface SkipTrackedTransaction {
    chainID: string,
    txHash: string
}

export function useSkipRoute(args: SkipRouteArgs) {

    const { data: currentPrice } = useCurrentPrice();

    const { data: account } = useAccount()
    const { connectAsync } = useConnect();

    const [trackedTransaction, setTrackedTransaction] = useState<SkipTrackedTransaction | undefined>(undefined)

    const swapAndExecute = useCallback(async () => {
        if (!currentPrice) {
            throw "Skip API is not ready to be used, no current price"
        }
        if (!account) {
            throw "Skip API is not ready to be used, no account"
        }
        // Retrieving the route
        const route = await skipClient.route({
            sourceAssetDenom: args.sourceAssetDenom,
            sourceAssetChainID: args.sourceAssetChainID,
            destAssetDenom: currentPrice.price.denom,
            destAssetChainID: ACTIVE_NETWORK.chain.chainId,
            amountOut: Math.trunc((parseInt(currentPrice.price.amount) * (1 + MORE_FUNDS_FACTOR))).toString(),
            smartRelay: true,
        });

        // Connect new chains and get the corresponding addresses for skip (for recovery mainly)
        const accounts = await connectAsync({
            chainId: route.requiredChainAddresses
        });

        const userAddresses: UserAddress[] = []
        for (const chainID of route.requiredChainAddresses) {
            userAddresses.push({
                chainID,
                address: accounts.accounts[chainID].bech32Address,
            })
        }
        const msg = {
            deposit: {
                message: prompt,
                receiver: {
                    addr: account.bech32Address,
                    chain: args.sourceAssetChainID,
                    denom: args.sourceAssetDenom,
                }
            }
        }
        const postRouteHandler: PostHandler = {
            wasmMsg: {
                contractAddress: ACTIVE_NETWORK.paiement,
                msg: JSON.stringify(msg)
            }
        }
        userAddresses[userAddresses.length - 1] = {
            chainID: ACTIVE_NETWORK.chain.chainId,
            address: ACTIVE_NETWORK.paiement
        }
        await skipClient.executeRoute({
            route: {
                ...route,
                postRouteHandler,
            } as RouteResponse,
            userAddresses,
            // Executes after all of the operations triggered by a user's signature complete.
            onTransactionCompleted: async (chainID, txHash, status) => {
                console.log(
                    `Route completed with tx hash: ${txHash} & status: ${status.state}`
                );
            },
            onTransactionBroadcast: async ({ txHash, chainID }) => {
                console.log(`Transaction broadcasted with tx hash: ${txHash}`);
            },
            onTransactionTracked: async ({ txHash, chainID }) => {
                setTrackedTransaction({
                    chainID,
                    txHash
                })
            },
        });
    }, [account, args.sourceAssetChainID, args.sourceAssetDenom, connectAsync, currentPrice])

    // await skipClient.transactionStatus({
    //     ...trackedTransaction
    // })


    return {
        sendViaSkip: swapAndExecute,
        trackedTransaction,
    }
}