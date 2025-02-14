import { mainnetChains, testnetChains } from "graz/chains";


export const MAX_MESSAGES_DEFAULT = 10;
export const MESSAGE_PAGE = 10;
export enum IbcChainType {
    COSMOS,
    PFM,
}
export interface Network {
    paiement: string,
    treasury: string
    chain: typeof testnetChains.neutrontestnet,
    character: string,
    ibcChains: {
        chain: typeof testnetChains.neutrontestnet,
        priceDenom: string,
        sourceChannel: string,
        targetChannel: string
        type: IbcChainType
    }[]
}

const TESTNET = {
    paiement: "neutron10xevfckk4ay9whldfcax0kzgrvzv3j6jvde0flhqulszz67xdvlq2pqjxt",
    treasury: "neutron17kstwwyxnrpw6jttn4ky0dwrqxs8ykqc5j2gvt",
    chain: {
        ...testnetChains.neutrontestnet, feeCurrencies: [
            { ...testnetChains.neutrontestnet.feeCurrencies[0], coinGeckoId: 'neutron-protocol' },
            ...testnetChains.neutrontestnet.feeCurrencies.slice(1),
        ],
    },
    character: "GAIA"
}

const MAINNET = {
    paiement: "neutron1s0kp244v9amczvk3lnkqh0r6phwurzvn0ru7ywq2mhm8vvuvcdhsh9yyhj",
    treasury: "neutron1dvlx4249q56z4wrgdn577393vvr5w6vhrkm8eet7ywkeefh3m0dq7ujj2u",
    chain: {
        ...mainnetChains.neutron, feeCurrencies: [
            { ...mainnetChains.neutron.feeCurrencies[1], coinGeckoId: 'cosmos-hub' },
        ],
        rpc: "https://rpc-lb.neutron.org"
    },
    // https://github.com/cosmos/chain-registry/blob/master/neutron/assetlist.json
    ibcChains: [{
        sourceChannel: "channel-569", // On cosmoshub
        targetChannel: "channel-1", // On neutron
        chain: mainnetChains.cosmoshub,
        priceDenom: "uatom",
        type: IbcChainType.COSMOS
    }, {
        sourceChannel: "channel-0", // On Osmosis
        targetChannel: "channel-141", // On cosmos
        chain: {
            ...mainnetChains.osmosis,
            feeCurrencies: [mainnetChains.osmosis.feeCurrencies.find((c) => c.coinDenom == "osmo")],
        },
        priceDenom: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        type: IbcChainType.PFM
    }],
    character: "GAIA"
}

export const POOL_INFORMATION_TESTNET = {
    pools: [{
        denom: "untrn",
        poolToUSDC: "neutron18c8qejysp4hgcfuxdpj4wf29mevzwllz5yh8uayjxamwtrs0n9fshq9vtv", // NTRN/USDC pool
    }],
    USDC: "ibc/B559A80D62249C8AA07A380E2A2BEA6E5CA9A6F079C912C3A9E9B494105E4F81",
    chain: {
        ...mainnetChains.neutron, feeCurrencies: [
            { ...mainnetChains.neutron.feeCurrencies[0], coinGeckoId: 'neutron-protocol' },
            ...mainnetChains.neutron.feeCurrencies.slice(1),
        ],
    }
}

export const POOL_INFORMATION_MAINNET = {
    pools: [{
        denom: "ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9", // ATOM ON NTRN
        poolToUSDC: "neutron1l48tsq2728tz0umh7l405t60h0wthtw908te9pfmcfgvku8cm2est9hq3j", // ATOM/UDSC POOL
    }, {
        denom: "untrn",
        poolToUSDC: "neutron18c8qejysp4hgcfuxdpj4wf29mevzwllz5yh8uayjxamwtrs0n9fshq9vtv", // NTRN/UDSC POOL
    }],
    USDC: "ibc/B559A80D62249C8AA07A380E2A2BEA6E5CA9A6F079C912C3A9E9B494105E4F81",
    chain: {
        ...mainnetChains.neutron, feeCurrencies: [
            { ...mainnetChains.neutron.feeCurrencies[0], coinGeckoId: 'neutron-protocol' },
            ...mainnetChains.neutron.feeCurrencies.slice(1),
        ],
    }
};

export const ACTIVE_NETWORK: Network = MAINNET;
export const POOL_INFORMATION = POOL_INFORMATION_MAINNET

export function useAvailableChains() {


    return [ACTIVE_NETWORK.chain, ...ACTIVE_NETWORK.ibcChains.map((c) => c.chain)]
}