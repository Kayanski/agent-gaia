
import { TimeoutStatus } from "@/lib/types";
import { ACTIVE_NETWORK } from "./blockchain/chains";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useCosmWasmClient } from "graz";
import { useQuery } from "@tanstack/react-query";


export interface ConfigResponse {
    current_price: string,
    paiement_denom: string,
    multiplier: string,
    shares: [string, string][],
    next_payment_key: number,
    last_message_timestamp: string,
    price_limit: string | undefined,
    time_limit: {
        min_messages: number,
        seconds_limit: number,
    },
}

function dateFromNano(nanoTimestamp: string): Date {
    // Convert nanoseconds to milliseconds
    const milliseconds = BigInt(nanoTimestamp) / BigInt(1_000_000);

    // Create a new Date object
    return new Date(Number(milliseconds));
}

export async function getConfig(cosmwasmClient?: CosmWasmClient) {

    if (!cosmwasmClient) {
        cosmwasmClient = await CosmWasmClient.connect(ACTIVE_NETWORK.chain.rpc);
    }

    const config: ConfigResponse = await cosmwasmClient.queryContractSmart(ACTIVE_NETWORK.paiement, {
        config: {}
    })

    return config
}

export type TimeoutStatusResponse = {
    "inactive": {
        current_messages: number,
        trigger_message_count: number
    }
} | {
    "active": {
        end_date: string
    }
}

export async function getTimeoutStatus(cosmwasmClient?: CosmWasmClient): Promise<TimeoutStatus> {
    if (!cosmwasmClient) {
        cosmwasmClient = await CosmWasmClient.connect(ACTIVE_NETWORK.chain.rpc);
    }

    const config: TimeoutStatusResponse = await cosmwasmClient.queryContractSmart(ACTIVE_NETWORK.paiement, {
        timeout_status: {}
    })

    if ("inactive" in config) {
        return {
            "inactive": {
                currentMessages: config["inactive"].current_messages,
                triggerMessageCount: config["inactive"].trigger_message_count
            }
        }
    } else {
        return {
            "active": {
                endDate: dateFromNano(config["active"].end_date)
            }
        }
    }
}

export function useTimeoutStatus() {
    const { data: cosmwasmClient } = useCosmWasmClient();

    return useQuery({
        queryKey: ['timeoutStatus'],
        queryFn: () =>
            getTimeoutStatus(cosmwasmClient)
    },
    );
}