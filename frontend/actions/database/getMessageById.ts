"use server"
import { neon } from "@neondatabase/serverless";
import { MESSAGE_FIELDS, parseDbMessageToTMessage, parseElizaMemoryToTMessage } from "@/lib/utils";
import { DbMessage, TMessage } from "./getMessages";
import { queryApi } from "./query";
import { MemoryWithUserName } from "gaia-server";
import { ApiResult } from "..";


export async function getHighestPaiementId(): Promise<number> {
    const highestPaiementId: ApiResult<number> = await queryApi("highestPaiementId")
    return highestPaiementId.result
}

export async function getMessageById(id: string): Promise<TMessage | undefined> {
    const message: ApiResult<MemoryWithUserName | undefined> = await queryApi(`messageById/${id}`)
    return message.result ? parseElizaMemoryToTMessage(message.result) : undefined
}

export async function getUserMessageByPaiementId(paiementId: number): Promise<TMessage | undefined> {
    const message: ApiResult<MemoryWithUserName | undefined> = await queryApi(`messageByPaiementId/${paiementId}`)
    return message.result ? parseElizaMemoryToTMessage(message.result) : undefined

}

export async function getAssistantMessageByPaiementId(paiementId: number): Promise<TMessage | undefined> {
    const message: ApiResult<MemoryWithUserName> = await queryApi(`assistantMessageByPaiementId/${paiementId}`)
    return message.result ? parseElizaMemoryToTMessage(message.result) : undefined;
}
