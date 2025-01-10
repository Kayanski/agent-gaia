import { ACTIVE_NETWORK } from "@/actions/gaia/constants";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";


export interface MessageResponse {
    message_id: number,
    price_paid: {
        amount: string,
        denom: string,
    }
    sender: string,
    msg: string,
    time: string,
}

export async function queryMessages(start_after: number | undefined, cosmwasmClient: CosmWasmClient | undefined): Promise<MessageResponse[]> {
    if (!cosmwasmClient) {
        cosmwasmClient = await CosmWasmClient.connect(ACTIVE_NETWORK.chain.rpc);
    }
    const messages = await cosmwasmClient.queryContractSmart(ACTIVE_NETWORK.paiement, {
        "messages": {
            limit: 20,
            start_after: start_after
        }
    });
    return messages
}

export async function queryMessage(messageId: number, cosmwasmClient: CosmWasmClient | undefined): Promise<MessageResponse> {
    if (!cosmwasmClient) {
        cosmwasmClient = await CosmWasmClient.connect(ACTIVE_NETWORK.chain.rpc);
    }
    const message = await cosmwasmClient.queryContractSmart(ACTIVE_NETWORK.paiement, {
        "message": {
            message_id: messageId
        }
    })
    return message
}