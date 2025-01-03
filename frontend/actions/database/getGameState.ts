"use server"
import { TGameState, TGameStateResponse, UniqueWalletResponse } from "@/lib/types";
import { queryApi } from "./query";

export async function getUniqueWallets(): Promise<number> {
    const data: UniqueWalletResponse = await queryApi("uniqueWallets")
    return data.wallets
}

export async function getGameState(): Promise<TGameState> {
    const gameStateResponse: TGameStateResponse = await queryApi("gameState")

    return {
        uniqueWallets: gameStateResponse.uniqueWallets,
        messagesCount: gameStateResponse.messagesCount,
        endgameTime: new Date(gameStateResponse.endgameTime),
        gameStatus: gameStateResponse.gameStatus
    }
}