import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { ACTIVE_NETWORK, POOL_INFORMATION } from "./gaia/constants";
import { useQuery } from "@tanstack/react-query";
import { useCosmWasmClient } from "@usecapsule/graz";


export interface CurrentPriceResponse {
    price: {
        denom: string,
        amount: string
    }
}

export async function getCurrentPrice(cosmwasmClient?: CosmWasmClient) {
    if (!cosmwasmClient) {
        cosmwasmClient = await CosmWasmClient.connect(ACTIVE_NETWORK.chain.rpc);
    }

    const price: CurrentPriceResponse = await cosmwasmClient.queryContractSmart(ACTIVE_NETWORK.paiement, {
        current_price: {}
    })

    return {
        price: price.price,
    }
}

export function useCurrentPrice() {
    const { data: cosmwasmClient } = useCosmWasmClient();

    return useQuery({
        queryKey: ['currentPrice'],
        queryFn: () =>
            getCurrentPrice(cosmwasmClient)
    },
    );
}

export async function getTokenPrice(cosmwasmClient?: CosmWasmClient, poolCosmwasmClient?: CosmWasmClient) {
    if (!cosmwasmClient) {
        cosmwasmClient = await CosmWasmClient.connect(ACTIVE_NETWORK.chain.rpc);
    }
    if (!poolCosmwasmClient) {
        poolCosmwasmClient = await CosmWasmClient.connect(POOL_INFORMATION.chain.rpc);
    }

    const paiementPrice: CurrentPriceResponse = await cosmwasmClient.queryContractSmart(ACTIVE_NETWORK.paiement, {
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

export function useTokenPrice() {
    const { data: poolCosmWasmClient } = useCosmWasmClient({
        chainId: POOL_INFORMATION.chain.chainId
    });
    const { data: cosmwasmClient } = useCosmWasmClient();

    return useQuery({
        queryKey: ['tokenPrice'],
        queryFn: () =>
            getTokenPrice(cosmwasmClient, poolCosmWasmClient)
    },
    );
}