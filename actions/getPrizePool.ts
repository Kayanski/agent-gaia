
import { ACTIVE_NETWORK } from "./gaia/constants";
import { StargateClient } from "@cosmjs/stargate";
import { getCurrentPrice, getTokenPrice } from "./getCurrentPrice";


export async function getPrizePool() {

    const price = await getCurrentPrice();
    const tokenPrice = await getTokenPrice();
    // We just query the balance of the treasury contract
    const client = await StargateClient.connect(ACTIVE_NETWORK.chain.rpc);
    const coinBalance = await client.getBalance(ACTIVE_NETWORK.treasury, price.price.denom)
    console.log(price, tokenPrice)

    return parseInt(coinBalance.amount) * tokenPrice / Math.pow(10, 6);
}