import { TGameState, TGameStateResponse, UniqueWalletResponse } from "@/lib/types";
import { queryApi } from "./query";
import { getCurrentPrice, useCurrentPrice } from "../blockchain/getCurrentPrice";
import { getPrizePool, usePrizePool } from "../blockchain/getPrizePool";
import { getTimeoutStatus, useTimeoutStatus } from "../getConfig";
import { useQuery } from "@tanstack/react-query";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";

export async function getUniqueWallets(): Promise<number> {
    // TODO : re-enable
    //     const data: UniqueWalletResponse = await queryApi("uniqueWallets")
    //     return data.wallets
    return 0
}


export async function getGameState(cosmwasmClient?: CosmWasmClient): Promise<TGameState> {
    // TODO : re-enable
    // const gameStateResponse: TGameStateResponse = await queryApi("gameState")

    const messagePrice = await getCurrentPrice(cosmwasmClient);
    const prizeFund = await getPrizePool(cosmwasmClient);
    const timeoutStatus = await getTimeoutStatus(cosmwasmClient);
    // TODO : re-enable

    // return {
    //     uniqueWallets: gameStateResponse.uniqueWallets,
    //     messagesCount: gameStateResponse.messagesCount,
    //     timeoutStatus,
    //     gameStatus: gameStateResponse.gameStatus,
    //     messagePrice: messagePrice.price,
    //     prizeFund,
    // }
    return {
        uniqueWallets: 0,
        messagesCount: 0,
        timeoutStatus,
        gameStatus: {
            isGameEnded: false, winner: undefined
        },
        messagePrice: messagePrice.price,
        prizeFund,
    }

}

export const GAME_STATE_QUERY_DEPENDENCIES = [
    ['currentPrice'],
    ['prizePool'],
    ['timeoutStatus'],
    ['tokenPrice']
]

export function useGameState() {
    const { data: messagePrice, isFetched: currentPriceFetched } = useCurrentPrice();
    const { data: prizeFund, isFetched: prizePoolFetched } = usePrizePool();
    const { data: timeoutStatus, isFetched: isFetchedTimeoutStatus } = useTimeoutStatus();

    return useQuery({
        queryKey: ['gameState'],
        queryFn: async () => {
            // TODO re-enable
            // const gameStateResponse: TGameStateResponse = await queryApi("gameState");
            if (!messagePrice) {
                throw "Unexpected un-avaiable message price"
            }
            if (!prizeFund) {
                throw "Unexpected un-avaiable prize fund"
            }
            if (!timeoutStatus) {
                throw "Unexpected un-avaiable timeout status"
            }

            return {
                uniqueWallets: 0,
                messagesCount: 0,
                timeoutStatus,
                gameStatus: {
                    isGameEnded: false,
                    winner: undefined
                },
                messagePrice: messagePrice.price,
                prizeFund,
            } as TGameState
        },
        enabled: currentPriceFetched && prizePoolFetched && isFetchedTimeoutStatus
    },
    );
}
