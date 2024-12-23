import { mainnetChains, testnetChains } from "graz/chains";


export const MAX_MESSAGES_DEFAULT = 10;
export const MESSAGE_PAGE = 10;

export const TESTNET = {
    paiement: "neutron1zjm6s6lfqccac7e002hdl68afgx0g78dgf2wtr5lu7jssadsu34qfvlwwq",
    treasury: "neutron17kstwwyxnrpw6jttn4ky0dwrqxs8ykqc5j2gvt",
    chain: {
        ...testnetChains.neutrontestnet, feeCurrencies: [
            { ...testnetChains.neutrontestnet.feeCurrencies[0], coinGeckoId: 'neutron-protocol' },
            ...testnetChains.neutrontestnet.feeCurrencies.slice(1),
        ],
    }
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

export function endGameDate() {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
}


export const ACTIVE_NETWORK = TESTNET;
export const POOL_INFORMATION = POOL_INFORMATION_TESTNET