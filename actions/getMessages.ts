"use server"

import { parseDbMessageToTMessage } from "@/lib/utils";
import { neon } from "@neondatabase/serverless";

export interface TMessage {
    content: string,
    id: string,
    fullConversation: string,
    role: "user" | "system",
    isWinner: boolean,
    userWallet: string,
    createdAt: Date
    paiementId: number | null,
    pricePaid: number | null
}

export interface DbMessage {
    id: string,
    address: string,
    prompt: string,
    submit_date: Date
    payment_id: number | null,
    price_paid: number | null
}


export async function getRecentMessages(userAddress: string | undefined, max?: number): Promise<TMessage[]> {


    const sql = neon(process.env.DATABASE_URL || "");

    const messages: DbMessage[] = await sql("SELECT id, address, prompt, submit_date FROM prompts LIMIT $1 ", [max ?? 100]) as unknown as DbMessage[];

    return messages.map(parseDbMessageToTMessage).filter((m) => {
        return m.userWallet != null
    })

}