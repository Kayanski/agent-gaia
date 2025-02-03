
import { ACTIVE_NETWORK } from "./gaia/constants";
import { getCurrentPrice, getTokenPrice, useCurrentPrice, useTokenPrice } from "./getCurrentPrice";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useCosmWasmClient } from "@usecapsule/graz";
import { useQuery } from "@tanstack/react-query";


export async function getPrizePool(cosmwasmClient?: CosmWasmClient) {
    if (!cosmwasmClient) {
        cosmwasmClient = await CosmWasmClient.connect(ACTIVE_NETWORK.chain.rpc);
    }

    const price = await getCurrentPrice(cosmwasmClient);
    const tokenPrice = await getTokenPrice(cosmwasmClient);
    // We just query the balance of the treasury contract
    const coinBalance = await cosmwasmClient.getBalance(ACTIVE_NETWORK.treasury, price.price.denom)

    return parseInt(coinBalance.amount) * tokenPrice / Math.pow(10, 6);
}

export function usePrizePool() {
    const { data: cosmwasmClient } = useCosmWasmClient();

    const { data: tokenPrice, isFetched: isFetchedTokenPrice } = useTokenPrice();
    const { data: currentPrice, isFetched: isFetchedCurrentPrice } = useCurrentPrice();

    return useQuery({
        queryKey: ['prizePool'],
        queryFn: async () => {
            if (!currentPrice || !tokenPrice || !cosmwasmClient) {
                throw "Unreachable inaccessible queries"
            }
            const coinBalance = await cosmwasmClient.getBalance(ACTIVE_NETWORK.treasury, currentPrice.price.denom);

            return parseInt(coinBalance.amount) * tokenPrice / Math.pow(10, 6);
        },
        enabled: isFetchedCurrentPrice && isFetchedTokenPrice && !!cosmwasmClient

    },
    );
}