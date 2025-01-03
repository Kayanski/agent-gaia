"use server"
import { neon } from "@neondatabase/serverless";

export async function resetWinner() {
    const sql = neon(process.env.DATABASE_URL || "");

    await sql(`UPDATE prompts SET is_winner = false`);
}

