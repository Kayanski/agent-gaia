//Client-side modal
'use client'

import { ACTIVE_NETWORK } from "@/actions/gaia/constants";
import { useAccount, useSuggestChainAndConnect, WalletType } from "graz";
import { useEffect } from "react";
import Image from 'next/image'

export function WalletModal({ closeModal }) {
    const { suggestAndConnect: connect } = useSuggestChainAndConnect()

    const { data: account } = useAccount()

    useEffect(() => {
        if (account?.bech32Address) {
            closeModal()
        }
    }, [account?.bech32Address, closeModal])

    return (<>
        Connect your Wallet :
        <div style={{ display: "flex", flexDirection: "row", alignItems: "middle" }}>
            <button onClick={() => connect({ chainInfo: ACTIVE_NETWORK.chain, walletType: WalletType.KEPLR })}><Image src="/keplr-wallet.png" width={40} height={40} alt="Keplr Wallet"></Image></button>

        </div >
    </>

    );
}