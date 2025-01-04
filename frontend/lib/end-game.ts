import { ACTIVE_NETWORK } from "@/actions/gaia/constants";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { GasPrice } from "@cosmjs/stargate";
import { getCurrentPrice } from "@/actions/getCurrentPrice";
import { queryApi } from "@/actions/database/query";
import { ApiResult } from "@/actions";


export async function endGame() {

    // We get the last message sender
    const lastSender: ApiResult<string | undefined> = await queryApi("lastMessageSender");
    if (!lastSender.result) {
        console.log("No senders, stopping")
        return;
    }

    // We get all the addresses
    const allAddresses: ApiResult<string[]> = await queryApi("allAddresses");

    const allNonLastSenderAddresses = allAddresses.result.filter((address) => {
        address != lastSender.result
    })

    // We need enough gas to cover all the transfers
    let totalGasCost = BigInt(ACTIVE_NETWORK.transferCost) * BigInt(allNonLastSenderAddresses.length + 1);

    // We get the total available funds
    const paiementPrice = await getCurrentPrice();
    const wallet: DirectSecp256k1HdWallet = await DirectSecp256k1HdWallet.fromMnemonic(process.env.TREASURY_MNEMONIC!, { prefix: "neutron" });
    const feeCurrencies = ACTIVE_NETWORK.chain.feeCurrencies[0];
    const cosmwasmClient = await SigningCosmWasmClient.connectWithSigner(ACTIVE_NETWORK.chain.rpc, wallet, {

        gasPrice: GasPrice.fromString(`${feeCurrencies.gasPriceStep.average.toString()}${feeCurrencies.coinMinimalDenom}`)
    });
    const accounts = await wallet.getAccounts()
    const totalBalance = await cosmwasmClient.getBalance(accounts[0].address, paiementPrice.price.denom);

    let availableBalanceAmount = BigInt(totalBalance.amount);
    if (paiementPrice.price.denom == feeCurrencies.coinMinimalDenom) {
        availableBalanceAmount -= totalGasCost;
    }

    // We send 10% to the last sender
    const firstSenderCoins = availableBalanceAmount / BigInt(10);
    await cosmwasmClient.sendTokens(accounts[0].address, lastSender.result, [{
        denom: paiementPrice.price.denom,
        amount: firstSenderCoins.toString()
    }], "auto", "You won Gaia's transfer!");


    // We split the rest between all the other addresses by batches of 100 transfers
    const chunkSize = 100;
    const participantCoins = (availableBalanceAmount - firstSenderCoins) / BigInt(allNonLastSenderAddresses.length);
    for (let i = 0; i < allNonLastSenderAddresses.length; i += chunkSize) {
        const chunk = allNonLastSenderAddresses.slice(i, i + chunkSize);
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