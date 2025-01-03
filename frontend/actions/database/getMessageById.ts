"use server"
import { neon } from "@neondatabase/serverless";
import { MESSAGE_FIELDS, parseDbMessageToTMessage, parseElizaMemoryToTMessage } from "@/lib/utils";
import { DbMessage, TMessage } from "./getMessages";
import { queryApi } from "./query";
import { MemoryWithUserName } from "gaia-server";


export async function getHighestPaiementId(): Promise<number> {
    const highestPaiementId: number = await queryApi("highestPaiementId")
    return highestPaiementId
}

export async function getMessageById(id: string): Promise<TMessage> {
    const message: MemoryWithUserName = await queryApi(`messageById/${id}`)
    return parseElizaMemoryToTMessage(message);
}

export async function getUserMessageByPaiementId(paiementId: number): Promise<TMessage | undefined> {
    const message: MemoryWithUserName | undefined = await queryApi(`messageByPaiementId/${paiementId}`)
    return message ? parseElizaMemoryToTMessage(message) : undefined

}

export async function getAssistantMessageByPaiementId(paiementId: number): Promise<TMessage | undefined> {
    const message: MemoryWithUserName = await queryApi(`assistantMessageByPaiementId/${paiementId}`)
    return message ? parseElizaMemoryToTMessage(message) : undefined;
}
