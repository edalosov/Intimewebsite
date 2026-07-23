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
          accentColor: "#9c7c3f",
          accentColorForeground: "#f5f1e9",
          borderRadius: "medium",
          fontStack: "system",
        })
      : darkTheme({
          accentColor: "#e8e3da",
          accentColorForeground: "#111111",
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
