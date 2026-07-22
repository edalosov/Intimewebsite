import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

// RainbowKit throws at module-init time if projectId is empty, which would
// otherwise crash the production build (including static pages that never
// touch wallet UI, like /_not-found) whenever the real WalletConnect env
// var isn't set yet. Fall back to a placeholder so the build always
// succeeds; the injected-wallet connectors (MetaMask, etc.) work fine
// regardless, only the WalletConnect QR option needs the real project ID.
export const wagmiConfig = getDefaultConfig({
  appName: "Intime Gallery",
  projectId: projectId && projectId.length > 0 ? projectId : "00000000000000000000000000000000",
  chains: [sepolia, mainnet],
  ssr: true,
});
