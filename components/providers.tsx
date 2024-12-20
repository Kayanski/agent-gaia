"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GrazProvider } from "graz";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";

import { config } from "../app/wagmi";
import { ACTIVE_NETWORK } from "@/actions/gaia/constants";
import { ToastContainer } from 'react-toastify';

// Graz
const queryClient = new QueryClient();

// End Graz

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <GrazProvider grazOptions={{
            chains: [ACTIVE_NETWORK.chain],
            chainsConfig: {
              [ACTIVE_NETWORK.chain.chainId]: {
                gas: {
                  price: ACTIVE_NETWORK.chain.feeCurrencies[0].gasPriceStep.average.toString(),
                  denom: ACTIVE_NETWORK.chain.feeCurrencies[0].coinDenom,
                },
              },
            }
          }} >
            {children}
            <ToastContainer />
          </GrazProvider >
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider >
  );
}