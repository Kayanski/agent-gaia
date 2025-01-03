import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { ACTIVE_NETWORK, POOL_INFORMATION } from "./gaia/constants";


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

export async function getTokenPrice() {
    const networkCosmwasmClient = await CosmWasmClient.connect(ACTIVE_NETWORK.chain.rpc);
    const poolCosmwasmClient = await CosmWasmClient.connect(POOL_INFORMATION.chain.rpc);

    const paiementPrice: CurrentPriceResponse = await networkCosmwasmClient.queryContractSmart(ACTIVE_NETWORK.paiement, {
        current_price: {}
    })

    const quote = 1000000;

    const beliefPrice = await poolCosmwasmClient.queryContractSmart(POOL_INFORMATION.poolToUSDC, {
        "simulation": {
            "offer_asset": {
                "info": {
                    "native_token": {
                        "denom": paiementPrice.price.denom,
                    }
                },
                "amount": quote.toString()
            },
            "ask_asset_info": {
                "native_token": {
                    "denom": POOL_INFORMATION.USDC
                }
            }
        }
    });
    return parseInt(beliefPrice.return_amount) / quote
}