"use client";

import { useAccount } from "wagmi";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { ArtworkGrid } from "@/components/ArtworkGrid";

export default function Home() {
  const { address, isConnected } = useAccount();

  if (!isConnected || !address) {
    return <WelcomeScreen />;
  }

  return <ArtworkGrid address={address} />;
}
