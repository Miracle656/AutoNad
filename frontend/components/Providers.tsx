"use client";

import React from "react";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "@/lib/wagmi";

import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

const monadTheme = darkTheme({
  accentColor: "#6E54FF",
  accentColorForeground: "white",
  borderRadius: "medium",
  fontStack: "system",
  overlayBlur: "small",
});

// Override background to match Monad dark
const customTheme = {
  ...monadTheme,
  colors: {
    ...monadTheme.colors,
    modalBackground: "#0E091C",
    profileForeground: "#0E091C",
    connectButtonBackground: "#6E54FF",
    connectButtonText: "white",
  },
  fonts: {
    body: "Roboto Mono, monospace",
  },
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={customTheme}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
