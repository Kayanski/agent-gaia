"use server"

import { MAX_MESSAGES_DEFAULT } from "@/app/page";
import { MESSAGE_FIELDS, parseDbMessageToTMessage, Role } from "@/lib/utils";
import { neon } from "@neondatabase/serverless";
import { Count } from "./getGameState";

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
        messages = await sql(`SELECT ${MESSAGE_FIELDS} FROM prompts WHERE address=$2 ORDER BY id DESC LIMIT $1 `, [max ?? MAX_MESSAGES_DEFAULT, userAddress]) as unknown as DbMessage[];
    } else {
        messages = await sql(`SELECT ${MESSAGE_FIELDS} FROM prompts ORDER BY id DESC LIMIT $1 `, [max ?? MAX_MESSAGES_DEFAULT]) as unknown as DbMessage[];
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

export async function getMessageCount(userAddress: string | undefined): Promise<number> {
    const sql = neon(process.env.DATABASE_URL || "");

    let messages: Count[]
    if (userAddress) {
        messages = await sql(`SELECT COUNT(*) FROM prompts WHERE address=$1 `, [userAddress]) as unknown as Count[];
    } else {
        messages = await sql(`SELECT COUNT(*) FROM prompts  `) as unknown as Count[];
    }

    return parseInt(messages[0].count);
}