"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GrazProvider } from "graz";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";

import { config } from "../app/wagmi";
import { testnetChains } from "graz/chains"

// Graz
const queryClient = new QueryClient();

// End Graz

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <GrazProvider grazOptions={{
            chains: [testnetChains.neutrontestnet],
            chainsConfig: {
              [testnetChains.neutrontestnet.chainId]: {
                gas: {
                  price: testnetChains.neutrontestnet.feeCurrencies[0].gasPriceStep.average.toString(),
                  denom: testnetChains.neutrontestnet.feeCurrencies[0].coinDenom,
                },
              },
            }
          }} >
            {children} </GrazProvider >
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider >
  );
}