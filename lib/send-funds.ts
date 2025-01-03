import { ACTIVE_NETWORK } from "@/actions/gaia/constants";
import { winner } from "@/actions";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { GasPrice } from "@cosmjs/stargate";
import { getCurrentPrice } from "@/actions/getCurrentPrice";


export async function sendTreasuryTo(winnerAddress: string) {

    const wallet: DirectSecp256k1HdWallet = await DirectSecp256k1HdWallet.fromMnemonic(process.env.TREASURY_MNEMONIC!, { prefix: "neutron" });
    const feeCurrencies = ACTIVE_NETWORK.chain.feeCurrencies[0];
    const cosmwasmClient = await SigningCosmWasmClient.connectWithSigner(ACTIVE_NETWORK.chain.rpc, wallet, {

        gasPrice: GasPrice.fromString(`${feeCurrencies.gasPriceStep.average.toString()}${feeCurrencies.coinMinimalDenom}`)
    });
    const accounts = await wallet.getAccounts()

    const paiementPrice = await getCurrentPrice();
    const totalBalance = await cosmwasmClient.getBalance(accounts[0].address, paiementPrice.price.denom);
    let availableBalanceAmount = BigInt(totalBalance.amount);
    if (paiementPrice.price.denom == feeCurrencies.coinMinimalDenom) {
        availableBalanceAmount -= BigInt(ACTIVE_NETWORK.transferCost);
    }

    await cosmwasmClient.sendTokens(accounts[0].address, winnerAddress, [{
        denom: paiementPrice.price.denom,
        amount: availableBalanceAmount.toString()
    }], "auto", "You won Gaia's transfer!");
}

async function sendTreasuryToWinner() {
    const winnerAddress = await winner();
    if (!winnerAddress) {
        throw new Error("No winner found")
    }
    await sendTreasuryTo(winnerAddress)

}


if (require.main === module) {
    /* eslint-disable @typescript-eslint/no-require-imports */
    require('dotenv').config();
    sendTreasuryToWinner()
}