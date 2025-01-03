"use server"

import { neon } from "@neondatabase/serverless";
import { Count } from "./getGameState";


export async function getMessagesCount(): Promise<number> {
    const sql = neon(process.env.DATABASE_URL || "");

    const messagesCount = await sql(`SELECT COUNT(prompt) FROM prompts WHERE paiement_id IS NOT NULL`) as unknown as Count[];

    return parseInt(messagesCount[0].count)
}