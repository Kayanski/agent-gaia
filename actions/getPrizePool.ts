
import { ACTIVE_NETWORK } from "./gaia/constants";
import { StargateClient } from "@cosmjs/stargate";
import { getCurrentPrice } from "./getSessionWithPrice";


export async function getPrizePool() {

    // We just query the balance of the treasury contract
    const client = await StargateClient.connect(ACTIVE_NETWORK.chain.rpc);

    const price = await getCurrentPrice();

    const coinBalance = await client.getBalance(ACTIVE_NETWORK.treasury, price.price.denom)

    return parseInt(coinBalance.amount) / Math.pow(10, 6);
}