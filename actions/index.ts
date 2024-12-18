"use server"
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate"
import { ACTIVE_NETWORK } from "./gaia/constants";
import { insertSystemMessage, insertUserMessage } from "./gaia/createDb";
import { getMessageByPaiementId, getMessagesByPaiementId } from "./getMessageById";
import { sendMessage } from "@/services/llm/claude";

export async function verifyAndExecuteLLMPublic(paiementId: number) {

    // We load the data from the database
    const savedMessage = await getMessageByPaiementId(paiementId)

    if (savedMessage.is_submitted) {
        return {
            success: true,
            error: undefined
        }
    }

    // If it's not submitted, we send the message to the AI
    const aiResponse = await sendMessage({
        messages: [{
            role: "user",
            content: savedMessage.content,
        }
        ]
    });

    await insertSystemMessage(aiResponse);

    // With this aiResponse, we save the message in memory

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
    await insertUserMessage({
        address: message.user,
        prompt: message.msg,
        time: message.time,
        pricePaid: message.price_paid.amount,
        paiementId: messageId
    })

}

