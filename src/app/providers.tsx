"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi";
import { useTheme } from "@/components/ThemeProvider";

import "@rainbow-me/rainbowkit/styles.css";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const { theme } = useTheme();

  const rainbowKitTheme =
    theme === "light"
      ? lightTheme({
          accentColor: "#111111",
          accentColorForeground: "#ffffff",
          borderRadius: "medium",
          fontStack: "system",
        })
      : darkTheme({
          accentColor: "#f5f5f5",
          accentColorForeground: "#0a0a0a",
          borderRadius: "medium",
          fontStack: "system",
        });

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={rainbowKitTheme}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
