"use server";

import { neon } from '@neondatabase/serverless';


export async function createDatabase() {
    const sql = neon(process.env.DATABASE_URL || "");
    await sql`CREATE TABLE IF NOT EXISTS prompts (
        id BIGSERIAL PRIMARY KEY, 
        address TEXT, 
        prompt TEXT, 
        is_submitted BOOLEAN DEFAULT false, 
        submit_date date, 
        price_paid integer,
        order_id integer, 
        paiement_id integer
    )`;
}

export interface MessageData {
    address: string,
    prompt: string,
    time: string
}

export async function insertMessage(message: MessageData) {
    const sql = neon(process.env.DATABASE_URL || "");

    await sql(`INSERT INTO prompts (id, 
        address, 
        prompt, 
        is_submitted, 
        submit_date
    ) VALUES (default, $1, $2, $3, $4)`, [message.address, message.prompt, false, new Date(parseInt(message.time) / 1000000)]);
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

