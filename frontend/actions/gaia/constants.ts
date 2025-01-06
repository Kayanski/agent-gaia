import { mainnetChains, testnetChains } from "graz/chains";
import { tree } from "next/dist/build/templates/app-page";


export const MAX_MESSAGES_DEFAULT = 10;
export const MESSAGE_PAGE = 10;
export interface Network {
    paiement: string,
    treasury: string
    chain: typeof testnetChains.neutrontestnet,
    transferCost: number,
    character: string
}

export const TESTNET = {
    paiement: "neutron1upeyln0cv8kh0kqjjjd2xmf5uzp4js2ts7de65s7gqy9sqs7w4tqwqplee",
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



export const ACTIVE_NETWORK: Network = TESTNET;
export const POOL_INFORMATION = POOL_INFORMATION_TESTNET