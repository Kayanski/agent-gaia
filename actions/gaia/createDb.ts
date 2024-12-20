"use server";

import { StructuredMessage } from '@/services/llm';
import { neon } from '@neondatabase/serverless';


export async function createDatabase() {
    const sql = neon(process.env.DATABASE_URL || "");

    // await sql`DROP TYPE role`;
    // await sql`CREATE TYPE role AS ENUM ('user', 'system', 'assistant')`;
    await sql`
        CREATE TABLE IF NOT EXISTS prompts (
            id BIGSERIAL PRIMARY KEY, 
            address TEXT, 
            prompt TEXT, 
            is_submitted BOOLEAN DEFAULT false, 
            submit_date date, 
            price_paid integer,
            paiement_id integer,
            poster_role role,
            is_winner BOOLEAN DEFAULT false
    )`;
}

export interface MessageData {
    address: string,
    prompt: string,
    time: string,
    paiementId: number,
    pricePaid: string
}

export async function insertUserMessage(message: MessageData) {
    const sql = neon(process.env.DATABASE_URL || "");

    await sql(`INSERT INTO prompts (id, 
        address, 
        prompt, 
        is_submitted, 
        submit_date,
        price_paid,
        paiement_id,
        poster_role
    ) VALUES (default, $1, $2, $3, $4, $5, $6, 'user')`, [message.address, message.prompt, false, new Date(parseInt(message.time) / 1000000), message.pricePaid, message.paiementId]);
}

export async function insertAssistantMessage(address: string, paiementId: number, answer: StructuredMessage) {
    const sql = neon(process.env.DATABASE_URL || "");

    await sql(`INSERT INTO prompts (id, 
        address, 
        prompt, 
        paiement_id,
        submit_date,
        is_submitted, 
        price_paid,
        poster_role,
        is_winner
    ) VALUES (default, $1, $2, $3, $4,true, NULL, 'assistant', $5)`, [address, answer.explanation, paiementId, new Date(), answer.decision]);
}

export async function messagePromptTransmitted(paiementId: number, isWinner: boolean) {
    const sql = neon(process.env.DATABASE_URL || "");

    await sql(`UPDATE prompts SET is_submitted = true,is_winner=$2 WHERE paiement_id = $1 AND poster_role='user'`, [paiementId, isWinner]);
}

