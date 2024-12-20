"use server"
import { neon } from "@neondatabase/serverless";
import { DbMessage, TMessage } from "./getMessages";
import { MESSAGE_FIELDS, parseDbMessageToTMessage } from "@/lib/utils";


export async function getHighestPaiementId(): Promise<number | undefined> {
    const sql = neon(process.env.DATABASE_URL || "");

    const message = await sql(`SELECT MAX(paiement_id) FROM prompts`);

    return message?.[0].max
}

export async function getMessageById(id: string): Promise<TMessage> {

    const sql = neon(process.env.DATABASE_URL || "");

    const message = await sql(`SELECT ${MESSAGE_FIELDS} FROM prompts  WHERE id=($1)`, [id]);

    return parseDbMessageToTMessage(message as unknown as DbMessage)
}

export async function getUserMessagesByPaiementId(paiementId: number): Promise<TMessage[]> {

    const sql = neon(process.env.DATABASE_URL || "");

    const messages = await sql(`SELECT ${MESSAGE_FIELDS} FROM prompts WHERE paiement_id=($1) AND poster_role='user'`, [paiementId]);


    return (messages as unknown as DbMessage[]).map(parseDbMessageToTMessage)
}
export async function getUserMessageByPaiementId(paiementId: number): Promise<TMessage> {

    const messages = await getUserMessagesByPaiementId(paiementId);

    if (!messages || messages.length == 0) {
        throw `No user message with this paiement id was found ${paiementId}`
    }

    return messages[0]
}

export async function getAssistantMessagesByPaiementId(paiementId: number): Promise<TMessage[]> {

    const sql = neon(process.env.DATABASE_URL || "");

    const dbMessages = await sql(`SELECT ${MESSAGE_FIELDS} FROM prompts WHERE paiement_id=($1) AND poster_role='assistant'`, [paiementId]);

    return (dbMessages as unknown as DbMessage[]).map(parseDbMessageToTMessage)
}

export async function getAssistantMessageByPaiementId(paiementId: number): Promise<TMessage> {

    const messages = await getAssistantMessagesByPaiementId(paiementId);

    if (!messages || messages.length == 0) {
        throw `No assistant message with this paiement id was found ${paiementId}`
    }

    return messages[0]
}
