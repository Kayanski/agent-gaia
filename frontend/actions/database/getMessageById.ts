"use server"
import { parseElizaMemoryToTMessage } from "@/lib/utils";
import { DbMessage, TMessage } from "./getMessages";
import { queryApi } from "./query";
import { ApiResult } from "..";
import { MemoryWithUserName } from "@/lib/types";


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
