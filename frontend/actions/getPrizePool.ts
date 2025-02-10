
import { ACTIVE_NETWORK, POOL_INFORMATION } from "./gaia/constants";
import { getTokenPrice, useAllTokenPrices, useCurrentPrice } from "./getCurrentPrice";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useCosmWasmClient } from "@usecapsule/graz";
import { useQuery } from "@tanstack/react-query";


export async function getPrizePool(cosmwasmClient?: CosmWasmClient) {
    if (!cosmwasmClient) {
        cosmwasmClient = await CosmWasmClient.connect(ACTIVE_NETWORK.chain.rpc);
    }

    const values = await Promise.all(POOL_INFORMATION.pools.map(async (pool) => {
        const tokenPrice = await getTokenPrice(pool.denom, cosmwasmClient);
        const coinBalance = await cosmwasmClient.getBalance(ACTIVE_NETWORK.treasury, pool.denom);

        return parseInt(coinBalance.amount) * tokenPrice / Math.pow(10, 6);
    }));

    return values.reduce((sum, current) => sum + current, 0);
}

export function usePrizePool() {
    const { data: cosmwasmClient } = useCosmWasmClient();


    const { data: tokenPrices, isFetched: isFetchedTokenPrice } = useAllTokenPrices();
    const { data: currentPrice, isFetched: isFetchedCurrentPrice } = useCurrentPrice();

    return useQuery({
        queryKey: ['prizePool'],
        queryFn: async () => {
            if (!currentPrice || !tokenPrices || !cosmwasmClient) {
                throw "Unreachable inaccessible queries"
            }
            let totalValue = 0;
            for (const token of tokenPrices) {
                const coinBalance = await cosmwasmClient.getBalance(ACTIVE_NETWORK.treasury, token.denom);
                totalValue += parseInt(coinBalance.amount) * token.price / Math.pow(10, 6);
            }

            return totalValue
        },
        enabled: isFetchedCurrentPrice && isFetchedTokenPrice && !!cosmwasmClient

    },
    );
}