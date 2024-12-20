"use server"
import { neon } from "@neondatabase/serverless";
import { getMessagesCount } from "./getMessagesCount";
import { endGameDate } from "./gaia/constants";

export type TGameState = {
    uniqueWallets: number,
    messagesCount: number
    endgameTime: Date,
    gameStatus: TGameStatus
}

export type TGameStatus = ({
    isGameEnded: true,
    winner: string
} | { isGameEnded: false, winner: undefined })


export interface Count {
    count: string
}

export async function getGameState(): Promise<TGameState> {
    const sql = neon(process.env.DATABASE_URL || "");

    const uniqueWallets = await sql(`SELECT COUNT(DISTINCT address) FROM prompts  `) as unknown as Count[];
    const messagesCount = await getMessagesCount();


    const winner = await sql(`SELECT address FROM prompts WHERE is_winner=true ORDER BY id LIMIT 1 `) as unknown as { address }[];
    console.log(winner)
    return {
        uniqueWallets: parseInt(uniqueWallets[0].count ?? "0"),
        messagesCount: messagesCount,
        endgameTime: endGameDate(),
        gameStatus: {

            isGameEnded: winner.length != 0,
            winner: winner[0].address
        }
    }
}