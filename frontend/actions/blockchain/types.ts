import { testnetChains } from "graz/chains"

export enum IbcChainType {
    COSMOS = "COSMOS",
    PFM = "PFM",
    SKIP = "SKIP",
}
export interface Network {
    paiement: string,
    treasury: string
    chain: typeof testnetChains.neutrontestnet,
    character: string,
    ibcChains: ({
        chain: typeof testnetChains.neutrontestnet,
        priceDenom: string,
        sourceChannel: string,
        targetChannel: string
        type: IbcChainType.COSMOS
    } | {
        chain: typeof testnetChains.neutrontestnet,
        priceDenom: string,
        sourceChannel: string,
        targetChannel: string,
        intermediaryChain: {
            sourceChannel: string,
            targetChannel: string,
        }
        type: IbcChainType.PFM
    } | {
        chain: typeof testnetChains.neutrontestnet,
        type: IbcChainType.SKIP
    })[]
}