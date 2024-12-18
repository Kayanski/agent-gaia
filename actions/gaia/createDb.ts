"use server";

import { StructuredMessage } from '@/services/llm';
import { neon } from '@neondatabase/serverless';


export async function createDatabase() {
    const sql = neon(process.env.DATABASE_URL || "");

    // await sql`CREATE TYPE role AS ENUM ('user', 'system')`;
    await sql`
        CREATE TABLE IF NOT EXISTS prompts (
            id BIGSERIAL PRIMARY KEY, 
            address TEXT, 
            prompt TEXT, 
            is_submitted BOOLEAN DEFAULT false, 
            submit_date date, 
            price_paid integer,
            order_id integer, 
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

export async function insertSystemMessage(answer: StructuredMessage) {
    const sql = neon(process.env.DATABASE_URL || "");

    await sql(`INSERT INTO prompts (id, 
        address, 
        prompt, 
        is_submitted, 
        submit_date,
        price_paid,
        paiement_id,
        poster_role
    ) VALUES (default, NULL, $1, true, $2, NULL, NULL, 'system')`, [answer.explanation, new Date()]);
}


export async function messagePromptTransmitted(message: MessageData) {
    const sql = neon(process.env.DATABASE_URL || "");

    await sql(`INSERT INTO prompts (
        address, 
        prompt, 
        is_submitted, 
        submit_date
    ) VALUES ($1, $2, $3, $4)`, [message.address, message.prompt, false, new Date()]);
}

