import { ACTIVE_NETWORK } from "@/actions/blockchain/chains";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { GasPrice } from "@cosmjs/stargate";
import { getCurrentPrice } from "@/actions/blockchain/getCurrentPrice";
import { queryApi } from "@/actions/database/query";
import { ApiResult } from "@/actions";
import { getTimeoutStatus } from "@/actions/getConfig";
import 'dotenv/config'


export async function endGame() {

    // We make sure the game is ended
    const timeoutStatus = await getTimeoutStatus();
    if ("inactive" in timeoutStatus) {
        console.warn("Not enough messages sent")
        return;
    }

    const endDate = timeoutStatus["active"].endDate;
    if (endDate.getTime() > Date.now()) {
        console.warn("Date is not elapsed, the game shouldn't be stopped")
        return;
    }

    // We get the last message sender
    const lastSender: ApiResult<string | undefined> = await queryApi("lastMessageSender");
    if (!lastSender.result) {
        console.log("No senders, stopping")
        return;
    }

    // We get all the addresses
    const allAddresses: ApiResult<string[]> = await queryApi("allAddresses");


    // We need enough gas to cover all the transfers
    // We get the total available funds
    const paiementPrice = await getCurrentPrice();
    const wallet: DirectSecp256k1HdWallet = await DirectSecp256k1HdWallet.fromMnemonic(process.env.TREASURY_MNEMONIC!, { prefix: "neutron" });
    const feeCurrencies = ACTIVE_NETWORK.chain.feeCurrencies[0];
    const cosmwasmClient = await SigningCosmWasmClient.connectWithSigner(ACTIVE_NETWORK.chain.rpc, wallet, {

        gasPrice: GasPrice.fromString(`${feeCurrencies.gasPriceStep.average.toString()}${feeCurrencies.coinMinimalDenom}`)
    });
    const accounts = await wallet.getAccounts()
    const totalBalance = await cosmwasmClient.getBalance(accounts[0].address, paiementPrice.price.denom);

    const availableBalanceAmount = BigInt(totalBalance.amount);

    // We send 10% to the last sender
    const firstSenderCoins = availableBalanceAmount / BigInt(10);
    await cosmwasmClient.sendTokens(accounts[0].address, lastSender.result, [{
        denom: paiementPrice.price.denom,
        amount: firstSenderCoins.toString()
    }], "auto", "You won Gaia's transfer!");



    // We split the rest between all the other addresses by batches of 100 transfers
    const chunkSize = 100;
    const participantCoins = (availableBalanceAmount - firstSenderCoins) / BigInt(allAddresses.result.length);
    for (let i = 0; i < allAddresses.result.length; i += chunkSize) {
        const chunk = allAddresses.result.slice(i, i + chunkSize);
        // We send the funds to the chunk

        const messages = chunk.map((address) => ({
            typeUrl: "/cosmos.bank.v1beta1.MsgSend",
            value: {
                fromAddress: accounts[0].address,
                toAddress: address,
                amount: [{
                    denom: paiementPrice.price.denom,
                    amount: participantCoins.toString()
                }]
            },
        }));
        await cosmwasmClient.signAndBroadcast(accounts[0].address, messages, "auto");
    }

}
if (require.main === module) {
    endGame();
}