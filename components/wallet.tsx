//Client-side modal
'use client'

import { ACTIVE_NETWORK } from "@/actions/gaia/constants";
import { useAccount, useConnect, WalletType } from "graz";
import { useEffect } from "react";

export function WalletModal({ closeModal }) {

    const { connect } = useConnect();
    const { data: account } = useAccount()

    useEffect(() => {
        if (account?.bech32Address) {
            closeModal()
        }
    }, [account?.bech32Address, closeModal])

    return (<>
        Connect your Wallet :
        <button onClick={() => connect({ chainId: ACTIVE_NETWORK.chain.chainId, walletType: WalletType.KEPLR })}>Connect</button>;
    </>

    );
}