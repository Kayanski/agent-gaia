//Client-side modal
'use client'

import { ACTIVE_NETWORK, useAvailableChains } from "@/actions/blockchain/chains";
import { getAvailableWallets, useAccount, useActiveChainIds, useConnect, useDisconnect, useSuggestChainAndConnect, WalletType } from "graz";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from 'next/image'
import { ChevronDown, Power, X } from "lucide-react";
import { create } from 'zustand';
import { CHAIN_COLORS, CHAIN_ICONS } from "@/actions/blockchain/metadata";


interface ChosenChainState {
    chain: typeof ACTIVE_NETWORK.chain;
    setChain: (newChain: typeof ACTIVE_NETWORK.chain) => void;
}

export const useChosenChainStore = create<ChosenChainState>((set) => ({
    chain: ACTIVE_NETWORK.chain,
    setChain: (newChain) => set(() => ({ chain: newChain })),
}));

const ICON_SIZE = 25;


export function WalletModal({ closeModal, isOpen }) {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                closeModal();
                setIsChainSelectOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [isOpen, closeModal]);

    const { data: account } = useAccount()
    const wallets = getAvailableWallets();
    const { disconnect } = useDisconnect();
    const chains = useActiveChainIds();
    const allChains = useAvailableChains();
    const { chain: chosenChain, setChain } = useChosenChainStore();
    const { connect } = useConnect()

    const allChainsInOrder = useMemo(() => {
        return allChains
    }, [allChains])


    const isConnectedModal = useMemo(() => {
        return !!account?.bech32Address
    }, [account?.bech32Address]);

    const [isChainSelectOpen, setIsChainSelectOpen] = useState(false);


    if (!isOpen) return null;
    return (<>{
        !isConnectedModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div ref={modalRef} className="bg-white rounded-2xl max-w-md w-full shadow-xl transform transition-all">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Connect Wallet</h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-500 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {wallets.keplr && <WalletButton walletType={WalletType.KEPLR} img="/keplr-wallet.png" alt="Keplr" />}
                            {wallets.leap && <WalletButton walletType={WalletType.LEAP} img="/leap-wallet.webp" alt="Leap" />}
                            {wallets.wc_keplr_mobile && <WalletButton walletType={WalletType.WC_KEPLR_MOBILE} img="/keplr-wallet.png" alt="Keplr Mobile" />}
                            {wallets.wc_leap_mobile && <WalletButton walletType={WalletType.WC_LEAP_MOBILE} img="/leap-wallet.webp" alt="Leap Mobile" />}
                            {wallets.walletconnect && <WalletButton walletType={WalletType.WALLETCONNECT} img="/wallet-connect.png" alt="Wallet Connect" />}
                        </div>

                    </div>
                </div>
            </div>)
    }
        {isConnectedModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div ref={modalRef} className="bg-white rounded-2xl max-w-md w-full shadow-xl">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Wallet Connected</h2>
                        <button
                            onClick={closeModal}
                            className="text-gray-400 hover:text-gray-500 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Connected Wallet Info */}
                        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                            <div className="flex-shrink-0">
                                <Image src={CHAIN_ICONS[chosenChain.chainId]} width={ICON_SIZE} height={ICON_SIZE} alt={chosenChain.chainName}></Image>

                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 capitalize">{chosenChain.chainName}</h3>
                                <p className="text-sm text-gray-500">Connected</p>
                            </div>
                        </div>

                        {/* Chain Selector */}
                        <div className="relative">
                            <button
                                onClick={() => setIsChainSelectOpen(!isChainSelectOpen)}
                                className="w-full p-4 flex items-center justify-between rounded-xl border border-gray-200 hover:border-blue-500 transition-all duration-200"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`flex-shrink-0 ${CHAIN_COLORS[chosenChain.chainId]}`}>
                                        <Image src={CHAIN_ICONS[chosenChain.chainId]} width={ICON_SIZE} height={ICON_SIZE} alt={chosenChain.chainName}></Image>
                                    </div>
                                    <span className="font-medium  capitalize">{chosenChain.chainName}</span>
                                </div>
                                <ChevronDown className={`w-5 h-5 transition-transform ${isChainSelectOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Chain Dropdown */}
                            {isChainSelectOpen && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden z-50">
                                    {allChainsInOrder.map((chain) => (
                                        <button
                                            key={chain.chainId}
                                            onClick={() => {
                                                connect({ chainId: chain.chainId })
                                                setChain(chain)
                                                setIsChainSelectOpen(false);
                                            }}
                                            className={`w-full p-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors
                          ${chain.chainId === chosenChain.chainId ? 'bg-blue-50' : ''}`}
                                        >
                                            <div className={`flex-shrink-0 ${CHAIN_COLORS[chain.chainId]}`}>
                                                <Image src={CHAIN_ICONS[chain.chainId]} width={ICON_SIZE} height={ICON_SIZE} alt={chosenChain.chainName}></Image>
                                            </div>
                                            <span className="font-medium capitalize" >{chain.chainName}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Disconnect Button */}
                        <button
                            onClick={() => {
                                disconnect();
                                setIsChainSelectOpen(false);
                            }}
                            className="w-full p-4 flex items-center justify-center space-x-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-all duration-200"
                        >
                            <Power className="w-5 h-5" />
                            <span>Disconnect Wallet</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>}

    </>);
}

export function WalletButton({ walletType, img, alt }: { walletType: WalletType, img: string, alt: string }) {
    const { suggestAndConnect } = useSuggestChainAndConnect()
    const { connect } = useConnect()
    const { setChain } = useChosenChainStore();
    return (<button
        key={walletType}
        onClick={() => {
            if (walletType == WalletType.KEPLR || walletType == WalletType.LEAP) {
                suggestAndConnect({ chainInfo: ACTIVE_NETWORK.chain, walletType })
            } else {
                connect({ chainId: ACTIVE_NETWORK.chain.chainId, walletType })
            }
            setChain(ACTIVE_NETWORK.chain)
        }}
        className="w-full p-4 flex items-center space-x-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
    >
        <div className="flex-shrink-0">
            <Image src={img} width={40} height={40} alt={alt}></Image>
        </div>
        <div className="flex-1 text-left">
            <h3 className="font-semibold text-gray-900">{alt}</h3>
            <p className="text-sm text-gray-500">Connect with {alt}</p>
        </div>
    </button>)
}