"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ACTIVE_NETWORK } from "@/actions/gaia/constants";
import { ToastContainer } from 'react-toastify';
import { CapsuleCosmosProvider, keplrWallet, leapWallet } from '@usecapsule/cosmos-wallet-connectors';
import { CapsuleProvider } from "./capsule";

// Graz
const queryClient = new QueryClient();

// End Graz
export function Providers({ children }: { children: React.ReactNode }) {
  const [chainId, setChainId] = useState<string>(ACTIVE_NETWORK.chain.chainId);

  return (
    <QueryClientProvider client={queryClient}>
      {/* <GrazProvider grazOptions={{
        chains: [ACTIVE_NETWORK.chain],
        chainsConfig: {
          [ACTIVE_NETWORK.chain.chainId]: {
            gas: {
              price: ACTIVE_NETWORK.chain.feeCurrencies[0].gasPriceStep.average.toString(),
              denom: ACTIVE_NETWORK.chain.feeCurrencies[0].coinMinimalDenom,
            },
          },
        },
        walletConnect: {
          options: {
            projectId: "c93bd3533007ae84dec279c3a67e9f46"
          }
        },
        capsuleConfig: {
          apiKey: process.env.NEXT_PUBLIC_CAPSULE_API_KEY,
          env: process.env.NEXT_PUBLIC_CAPSULE_ENV as any,
        },
      }} > */}
      <CapsuleCosmosProvider
        chains={[ACTIVE_NETWORK.chain]}
        wallets={[keplrWallet, leapWallet]}
        selectedChainId={chainId}
        onSwitchChain={chainId => {
          setChainId(chainId);
        }}
        multiChain
        walletConnect={{ options: { projectId: 'c93bd3533007ae84dec279c3a67e9f46' } }}
      >
        <CapsuleProvider>
          {children}
        </CapsuleProvider>
      </CapsuleCosmosProvider>
      <ToastContainer />
      {/* </GrazProvider > */}
    </QueryClientProvider>
  );
}