import { useAccount, useCosmWasmClient } from "graz";
import { useCurrentPrice } from "./getCurrentPrice";
import { ACTIVE_NETWORK } from "./blockchain/chains";
import { useQuery } from "@tanstack/react-query";


export function usePriceBalance(chainId?: string) {

    const { data: price } = useCurrentPrice();
    const { data: account } = useAccount({ chainId });

    if (!chainId) {
        chainId = ACTIVE_NETWORK.chain.chainId
    }
    let denom;
    if (chainId == ACTIVE_NETWORK.chain.chainId) {
        denom = price?.price.denom
    } else {
        denom = ACTIVE_NETWORK.ibcChains.find((chain) => chain.chain.chainId == chainId)?.priceDenom
    }

    const { data: cosmwasmClient } = useCosmWasmClient({ chainId });

    return useQuery({
        queryKey: ['balance', chainId, denom,],
        queryFn: async () => {
            if (!cosmwasmClient || !account?.bech32Address) {
                return "Error with cosmwasm client"
            }
            const balance = await cosmwasmClient.getBalance(account?.bech32Address, denom)
            return balance.amount ?? 0
        },
        enabled: !!cosmwasmClient && !!account?.bech32Address

    },
    );
}
