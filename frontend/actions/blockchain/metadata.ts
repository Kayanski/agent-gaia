import { mainnetChains } from "graz/chains"

export const CHAIN_ICONS = {
    "neutron-1": "/neutron.png",
    "cosmoshub-4": "/cosmos.svg",
    [mainnetChains.osmosis.chainId]: "/osmo.svg"
}

export const CHAIN_COLORS = {
    "neutron-1": "black",
    "cosmoshub-4": "green",
    [mainnetChains.osmosis.chainId]: "bg-purple-200"
}