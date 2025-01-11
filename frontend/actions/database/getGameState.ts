import { TGameState, TGameStateResponse, UniqueWalletResponse } from "@/lib/types";
import { queryApi } from "./query";
import { getCurrentPrice } from "../getCurrentPrice";
import { getPrizePool } from "../getPrizePool";
import { getTimeoutStatus } from "../getConfig";
import { useQuery } from "@tanstack/react-query";

export async function getUniqueWallets(): Promise<number> {
    const data: UniqueWalletResponse = await queryApi("uniqueWallets")
    return data.wallets
}


export async function getGameState(): Promise<TGameState> {
    const gameStateResponse: TGameStateResponse = await queryApi("gameState")

    const messagePrice = await getCurrentPrice();
    const prizeFund = await getPrizePool();
    const timeoutStatus = await getTimeoutStatus();

    return {
        uniqueWallets: gameStateResponse.uniqueWallets,
        messagesCount: gameStateResponse.messagesCount,
        timeoutStatus,
        gameStatus: gameStateResponse.gameStatus,
        messagePrice: messagePrice.price,
        prizeFund,
    }
}

export function useGameState() {
    return useQuery({
        queryKey: ['gameState'],
        queryFn: () =>
            getGameState()
    },
    );
}