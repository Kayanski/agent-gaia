import { neon } from "@neondatabase/serverless";
import { DbMessage, TMessage } from "./getMessages";
import { MESSAGE_FIELDS, parseDbMessageToTMessage } from "@/lib/utils";




export async function getMessageById(id: string): Promise<TMessage> {

    const sql = neon(process.env.DATABASE_URL || "");

    const message = await sql(`SELECT ${MESSAGE_FIELDS} FROM prompts  WHERE id=($1)`, [id]);

    return parseDbMessageToTMessage(message as unknown as DbMessage)
}


export async function getMessagesByPaiementId(paiementId: number): Promise<TMessage[]> {

    const sql = neon(process.env.DATABASE_URL || "");

    const messages = await sql(`SELECT ${MESSAGE_FIELDS} FROM prompts WHERE paiement_id=($1)`, [paiementId]);

    return (messages as unknown as DbMessage[]).map(parseDbMessageToTMessage)
}
