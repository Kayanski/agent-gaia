"use server"

import { neon } from "@neondatabase/serverless";
import { ACTIVE_NETWORK } from "../gaia/constants";
import PostgresDatabaseAdapter from "@elizaos/adapter-postgres";
import { queryApi } from "./query";


export async function getMessagesCount(): Promise<number> {
    const data: number = await queryApi("messagesCount")
    return data
}