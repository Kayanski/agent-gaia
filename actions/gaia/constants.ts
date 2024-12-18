import { testnetChains } from "graz/chains";

export const TESTNET = {
    paiement: "neutron1qym3s03jdnejs4lfmkdu8vfwufge5ttcfjjhln5vppjhjj64ynqqu4ypvj",
    treasury: "neutron17kstwwyxnrpw6jttn4ky0dwrqxs8ykqc5j2gvt",
    chain: {
        ...testnetChains.neutrontestnet, feeCurrencies: [
            { ...testnetChains.neutrontestnet.feeCurrencies[0], coinGeckoId: 'neutron-protocol' },
            ...testnetChains.neutrontestnet.feeCurrencies.slice(1),
        ],
    }
}

export function endGameDate() {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
}


export const ACTIVE_NETWORK = TESTNET;