"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";

import { config } from "@/wagmi";
import { SessionProvider } from "next-auth/react";
import { RainbowKitSiweNextAuthProvider } from "@rainbow-me/rainbowkit-siwe-next-auth";
import { hashFn } from "@wagmi/core/query";
import { TokenProvider } from "@/contexts/TokenContext";
import { SlippageProvider } from "@/contexts/SlippageContext";
import { SwapProvider } from "@/contexts/SwapContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: hashFn,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
              <QueryClientProvider client={queryClient}>
      <TokenProvider>
        <SlippageProvider>
          <SwapProvider>
            <SessionProvider>
                <RainbowKitSiweNextAuthProvider>
                  <RainbowKitProvider showRecentTransactions={true}>
                    {children}
                  </RainbowKitProvider>
                </RainbowKitSiweNextAuthProvider>
            </SessionProvider>
          </SwapProvider>
        </SlippageProvider>
      </TokenProvider>
              </QueryClientProvider>
    </WagmiProvider>
  );
}
