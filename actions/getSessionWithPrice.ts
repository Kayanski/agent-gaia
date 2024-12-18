import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { ACTIVE_NETWORK } from "./gaia/constants";


export interface CurrentPriceResponse {
    price: {
        denom: string,
        amount: string
    }
}

export async function getCurrentPrice() {
    const cosmwasmClient = await CosmWasmClient.connect(ACTIVE_NETWORK.chain.rpc);

    const price: CurrentPriceResponse = await cosmwasmClient.queryContractSmart(ACTIVE_NETWORK.paiement, {
        current_price: {}
    })

    return {
        price: price.price,
    }
}