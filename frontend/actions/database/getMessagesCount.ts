"use server"

import { queryApi } from "./query";


export async function getMessagesCount(): Promise<number> {
    const data: number = await queryApi("messagesCount")
    return data
}