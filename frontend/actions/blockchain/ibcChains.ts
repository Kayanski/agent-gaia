import { mainnetChains } from "graz/chains";
import { IbcChainType, Network } from "./types";

export const cosmosIbcChain: Network["ibcChains"][0] = {
    sourceChannel: "channel-569", // On cosmoshub
    targetChannel: "channel-1", // On neutron
    chain: mainnetChains.cosmoshub,
    priceDenom: "uatom",
    type: IbcChainType.COSMOS
};

export const osmosisIbcChain: Network["ibcChains"][0] = {
    sourceChannel: "channel-0", // On Osmosis
    targetChannel: "channel-141", // On cosmos
    chain: {
        ...mainnetChains.osmosis,
        feeCurrencies: [{ // manual because the osmosis object doesn't have the same structure at all
            coinDenom: "osmo",
            coinMinimalDenom: "uosmo",
            coinDecimals: 6,
            coinGeckoId: "osmosis",
            gasPriceStep: {
                low: 0.0025,
                average: 0.025,
                high: 0.04
            }
        }],
    },
    intermediaryChain: cosmosIbcChain,
    priceDenom: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
    type: IbcChainType.PFM
}

export const nobleIbcChain: Network["ibcChains"][0] = {
    chain: mainnetChains.noble,
    type: IbcChainType.SKIP
};