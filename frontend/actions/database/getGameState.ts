"use server"
import { TGameState, TGameStateResponse, UniqueWalletResponse } from "@/lib/types";
import { queryApi } from "./query";
import { getCurrentPrice } from "../getCurrentPrice";
import { getPrizePool } from "../getPrizePool";
import { getConfig } from "../getConfig";

export async function getUniqueWallets(): Promise<number> {
    const data: UniqueWalletResponse = await queryApi("uniqueWallets")
    return data.wallets
}

function addSecondsToNanoTimestamp(nanoTimestamp: string, secondsToAdd: number): Date {
    // Convert nanoseconds to milliseconds
    const milliseconds = BigInt(nanoTimestamp) / BigInt(1_000_000);

    // Add seconds (in milliseconds)
    const updatedMilliseconds = milliseconds + BigInt(secondsToAdd * 1000);

    // Create a new Date object
    return new Date(Number(updatedMilliseconds));
}

export async function getGameState(): Promise<TGameState> {
    const gameStateResponse: TGameStateResponse = await queryApi("gameState")

    const messagePrice = await getCurrentPrice();
    const prizeFund = await getPrizePool();
    const config = await getConfig();

    return {
        uniqueWallets: gameStateResponse.uniqueWallets,
        messagesCount: gameStateResponse.messagesCount,
        endgameCondition: config.next_payment_key > config.time_limit.min_messages ? {
            date: addSecondsToNanoTimestamp(config.last_message_timestamp, config.time_limit.seconds_limit)
        } : {
            currentMessageNumber: config.next_payment_key,
            triggerMessageNumber: config.time_limit.min_messages
        },
        gameStatus: gameStateResponse.gameStatus,
        messagePrice: messagePrice.price,
        prizeFund,
    }
}