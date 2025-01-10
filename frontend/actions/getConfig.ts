
import { ACTIVE_NETWORK } from "./gaia/constants";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";


export interface ConfigResponse {
    current_price: string,
    paiement_denom: string,
    multiplier: string,
    shares: [string, string][],
    next_payment_key: number,
    last_message_timestamp: string,
    price_limit: string | undefined,
    time_limit: {
        min_messages: number,
        seconds_limit: number,
    },
}

export async function getConfig() {
    const cosmwasmClient = await CosmWasmClient.connect(ACTIVE_NETWORK.chain.rpc);

    const config: ConfigResponse = await cosmwasmClient.queryContractSmart(ACTIVE_NETWORK.paiement, {
        config: {}
    })

    return config
}