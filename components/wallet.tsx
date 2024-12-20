//Client-side modal
'use client'

import { ACTIVE_NETWORK } from "@/actions/gaia/constants";
import { useAccount, useConnect, useSuggestChainAndConnect, WalletType } from "graz";
import { useEffect } from "react";
import Image from 'next/image'

export function WalletModal({ closeModal }) {

    const { data: account } = useAccount()

    useEffect(() => {
        if (account?.bech32Address) {
            closeModal()
        }
    }, [account?.bech32Address, closeModal])

    return (<>
        Connect your Wallet :
        <div style={{ display: "flex", flexDirection: "row", alignItems: "middle", margin: "20px", gap: "30px", flexWrap: "wrap" }}>
            <WalletButton walletType={WalletType.KEPLR} img="/keplr-wallet.png" alt="Keplr" />
            <WalletButton walletType={WalletType.LEAP} img="/leap-wallet.webp" alt="Leap" />
        </div >
    </>
    );
}

export function WalletButton({ walletType, img, alt }: { walletType: WalletType, img: string, alt: string }) {
    const { suggestAndConnect } = useSuggestChainAndConnect()
    const { connect } = useConnect()



    return (<button style={{
        flex: "1 0 33%",
        display: "flex",
        flexDirection: "row",
        gap: "10px",
        alignItems: "center",
    }} onClick={() => {
        if (walletType == WalletType.KEPLR || walletType == WalletType.LEAP) {
            suggestAndConnect({ chainInfo: ACTIVE_NETWORK.chain, walletType })
        } else {
            connect({ chainId: ACTIVE_NETWORK.chain.chainId, walletType })
        }
    }}> <Image src={img} width={40} height={40} alt={alt}></Image> {alt}</button >)
}