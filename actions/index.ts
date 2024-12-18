"use server"
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate"
import { ACTIVE_NETWORK } from "./gaia/constants";
import { insertMessage } from "./gaia/createDb";
import { getMessagesByPaiementId } from "./getMessageById";

export async function verifyAndExecuteLLMPublic(paiementId: number) {
    return {
        success: true,
        error: undefined
    }
}

export interface MessageResponse {
    message_id: number,
    price_paid: {
        amount: string,
        denom: string,
    }
    user: string,
    msg: string,
    time: string,
}

export async function submitPrompt(messageId: number) {
    // We receive a prompt here, we need to make sure
    // - It doesn't exist locally
    const localMessages = await getMessagesByPaiementId(messageId)
    if (localMessages.length != 0) {
        return
    }

    // - It exists on-chain
    const cosmwasmClient = await CosmWasmClient.connect(ACTIVE_NETWORK.chain.rpc);
    const message: MessageResponse = await cosmwasmClient.queryContractSmart(ACTIVE_NETWORK.paiement, {
        "message": {
            message_id: messageId
        }
    })

    // We save it locally
    await insertMessage({
        address: message.user,
        prompt: message.msg,
        time: message.time
    })

}

