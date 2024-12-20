"use server"

import { MESSAGE_FIELDS, parseDbMessageToTMessage, Role } from "@/lib/utils";
import { neon } from "@neondatabase/serverless";

export interface TMessage {
    content: string,
    id: string,
    fullConversation: string,
    role: Role
    isWinner: boolean,
    userWallet: string,
    createdAt: Date
    paiementId: number | null,
    pricePaid: number | null,
    is_submitted: boolean,
}

export interface DbMessage {
    id: string,
    address: string,
    prompt: string,
    submit_date: Date,
    is_submitted: boolean,
    paiement_id: number | null,
    price_paid: number | null,
    poster_role: Role,
    is_winner: boolean
}


export async function getRecentMessages(userAddress: string | undefined, max?: number): Promise<TMessage[]> {
    const sql = neon(process.env.DATABASE_URL || "");

    let messages: DbMessage[];
    if (userAddress) {
        messages = await sql(`SELECT ${MESSAGE_FIELDS} FROM prompts WHERE address=$2 ORDER BY id DESC LIMIT $1 `, [max ?? 100, userAddress]) as unknown as DbMessage[];
    } else {
        messages = await sql(`SELECT ${MESSAGE_FIELDS} FROM prompts ORDER BY id DESC LIMIT $1 `, [max ?? 100]) as unknown as DbMessage[];
    }
    messages.reverse()

    return messages.map(parseDbMessageToTMessage).filter((m) => {
        return m.userWallet != null
    })
}

export async function getMaxPaiementIdByRole(role: Role): Promise<number | undefined> {
    const sql = neon(process.env.DATABASE_URL || "");

    const maxQueried = await sql(`SELECT MAX(paiement_id) FROM prompts WHERE poster_role=$1`, [role]);

    return maxQueried[0].max;
}