import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { ACTIVE_NETWORK, POOL_INFORMATION } from "./blockchain/chains";
import { useQuery } from "@tanstack/react-query";
import { useCosmWasmClient } from "graz";
import { Poppins } from "next/font/google";


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
            getCurrentPrice(cosmwasmClient),
    },
    );
}

export async function getTokenPrice(denom: string, cosmwasmClient?: CosmWasmClient, poolCosmwasmClient?: CosmWasmClient) {
    if (!cosmwasmClient) {
        cosmwasmClient = await CosmWasmClient.connect(ACTIVE_NETWORK.chain.rpc);
    }
    if (!poolCosmwasmClient) {
        poolCosmwasmClient = await CosmWasmClient.connect(POOL_INFORMATION.chain.rpc);
    }

    const quote = 1000000;

    const pool = POOL_INFORMATION.pools.find((el) => el.denom == denom)?.poolToUSDC;
    if (!pool) {
        // No pool information, price is 0
        return 0
    }

    const beliefPrice = await poolCosmwasmClient.queryContractSmart(pool, {
        "simulation": {
            "offer_asset": {
                "info": {
                    "native_token": {
                        "denom": denom,
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

export function useAllTokenPrices() {
    const { data: poolCosmWasmClient } = useCosmWasmClient({
        chainId: POOL_INFORMATION.chain.chainId
    });
    const { data: cosmwasmClient } = useCosmWasmClient();

    return useQuery({
        queryKey: ['allTokenPrices'],
        queryFn: () => {
            return Promise.all(POOL_INFORMATION.pools.map(async (pool) => {
                const tokenPrice = await getTokenPrice(pool.denom, cosmwasmClient, poolCosmWasmClient)
                return {
                    denom: pool.denom,
                    price: tokenPrice
                }
            }));
        }
    },
    );
}