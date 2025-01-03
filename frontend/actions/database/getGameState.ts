"use server"
import { neon } from "@neondatabase/serverless";
import { ACTIVE_NETWORK } from "@/actions/gaia/constants";
import { getMessagesCount } from "./getMessagesCount";
import PostgresDatabaseAdapter from "@elizaos/adapter-postgres";
import type { UniqueWalletResponse, TGameState, TGameStateResponse } from "gaia-server";
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