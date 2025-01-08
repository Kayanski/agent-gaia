"use server"
import { TGameState, TGameStateResponse, UniqueWalletResponse } from "@/lib/types";
import { queryApi } from "./query";
import { getCurrentPrice } from "../getCurrentPrice";
import { getPrizePool } from "../getPrizePool";

export async function getUniqueWallets(): Promise<number> {
    const data: UniqueWalletResponse = await queryApi("uniqueWallets")
    return data.wallets
}

export async function getGameState(): Promise<TGameState> {
    const gameStateResponse: TGameStateResponse = await queryApi("gameState")

    const messagePrice = await getCurrentPrice();
    const prizeFund = await getPrizePool();


    return {
        uniqueWallets: gameStateResponse.uniqueWallets,
        messagesCount: gameStateResponse.messagesCount,
        endgameTime: new Date(gameStateResponse.endgameTime),
        gameStatus: gameStateResponse.gameStatus,
        messagePrice: messagePrice.price,
        prizeFund,
    }
}