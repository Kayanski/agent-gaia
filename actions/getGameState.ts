"use server"
import { neon } from "@neondatabase/serverless";
import { getMessagesCount } from "./getMessagesCount";
import { endGameDate } from "./gaia/constants";

export interface TGameState {
    uniqueWallets: number,
    messagesCount: number
    endgameTime: Date,
    isGameEnded: boolean
}

export interface Count {
    count: string
}

export async function getGameState(): Promise<TGameState> {

    const sql = neon(process.env.DATABASE_URL || "");

    const uniqueWallets = await sql(`SELECT COUNT(DISTINCT address) FROM prompts  `) as unknown as Count[];
    const messagesCount = await getMessagesCount();

    return {
        uniqueWallets: parseInt(uniqueWallets[0].count ?? "0"),
        messagesCount: messagesCount,
        endgameTime: endGameDate(),
        isGameEnded: false,
    }
}