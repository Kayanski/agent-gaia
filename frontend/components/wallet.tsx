//Client-side modal
'use client'

import { ACTIVE_NETWORK } from "@/actions/gaia/constants";
import { getAvailableWallets, useAccount, useConnect, useSuggestChainAndConnect, WalletType } from "@usecapsule/graz";
import { useEffect } from "react";
import Image from 'next/image'

export function WalletModal({ closeModal }) {

    const { data: account } = useAccount()
    const wallets = getAvailableWallets();

    useEffect(() => {
        if (account?.bech32Address) {
            closeModal()
        }
    }, [account?.bech32Address, closeModal])

    return (<>
        Connect your Wallet :
        <div style={{ display: "flex", flexDirection: "row", alignItems: "middle", justifyContent: "center", margin: "20px", gap: "30px", flexWrap: "wrap" }}>
            {wallets.keplr && <WalletButton walletType={WalletType.KEPLR} img="/keplr-wallet.png" alt="Keplr" />}
            {wallets.leap && <WalletButton walletType={WalletType.LEAP} img="/leap-wallet.webp" alt="Leap" />}
            {wallets.wc_keplr_mobile && <WalletButton walletType={WalletType.WC_KEPLR_MOBILE} img="/keplr-wallet.png" alt="Keplr Mobile" />}
            {wallets.wc_leap_mobile && <WalletButton walletType={WalletType.WC_LEAP_MOBILE} img="/leap-wallet.webp" alt="Leap Mobile" />}
            {wallets.walletconnect && <WalletButton walletType={WalletType.WALLETCONNECT} img="/wallet-connect.png" alt="Wallet Connect" />}
            {wallets.capsule && <WalletButton walletType={WalletType.CAPSULE} img="/capsule.png" alt="Capsule" />}

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