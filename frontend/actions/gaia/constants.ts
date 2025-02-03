import { mainnetChains, testnetChains } from "@usecapsule/graz/chains";


export const MAX_MESSAGES_DEFAULT = 10;
export const MESSAGE_PAGE = 10;
export interface Network {
    paiement: string,
    treasury: string
    chain: typeof testnetChains.neutrontestnet,
    transferCost: number,
    character: string
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
    transferCost: 1000,
    character: "GAIA"
}

const MAINNET = {
    paiement: "neutron19mdfu8gkcawwzwe29hvkjmvjm6eeg8psp9hg0k6893eutj68jcqq5hcv7y",
    treasury: "neutron1dvlx4249q56z4wrgdn577393vvr5w6vhrkm8eet7ywkeefh3m0dq7ujj2u",
    chain: {
        ...mainnetChains.neutron, feeCurrencies: [
            { ...mainnetChains.neutron.feeCurrencies[1], coinGeckoId: 'cosmos-hub' },
        ],
        rpc: "https://rpc-lb.neutron.org"
    },
    transferCost: 1000,
    character: "GAIA"
}
export const POOL_INFORMATION_TESTNET = {
    poolToUSDC: "neutron18c8qejysp4hgcfuxdpj4wf29mevzwllz5yh8uayjxamwtrs0n9fshq9vtv",
    USDC: "ibc/B559A80D62249C8AA07A380E2A2BEA6E5CA9A6F079C912C3A9E9B494105E4F81",
    chain: {
        ...mainnetChains.neutron, feeCurrencies: [
            { ...mainnetChains.neutron.feeCurrencies[0], coinGeckoId: 'neutron-protocol' },
            ...mainnetChains.neutron.feeCurrencies.slice(1),
        ],
    }
}

export const POOL_INFORMATION_MAINNET = {
    poolToUSDC: "neutron1l48tsq2728tz0umh7l405t60h0wthtw908te9pfmcfgvku8cm2est9hq3j",
    USDC: "ibc/B559A80D62249C8AA07A380E2A2BEA6E5CA9A6F079C912C3A9E9B494105E4F81",
    chain: {
        ...mainnetChains.neutron, feeCurrencies: [
            { ...mainnetChains.neutron.feeCurrencies[0], coinGeckoId: 'neutron-protocol' },
            ...mainnetChains.neutron.feeCurrencies.slice(1),
        ],
    }
}





export const ACTIVE_NETWORK: Network = MAINNET;
export const POOL_INFORMATION = POOL_INFORMATION_MAINNET