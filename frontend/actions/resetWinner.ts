"use server"

import { ACTIVE_NETWORK } from "./blockchain/chains";

export async function resetWinner() {
    await (await fetch(`${process.env.API_URL}/${ACTIVE_NETWORK.character}/resetWinner`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.API_BEARER_TOKEN}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    })).json();
}

