import type { NextConfig } from "next";

const x402Stub = "./src/stubs/empty.ts";

const nextConfig: NextConfig = {
  // Coinbase's wallet SDK (pulled in transitively by RainbowKit's default
  // connectors) lazily imports optional x402 payment packages we don't use
  // and don't install; stub them out so the build doesn't fail trying to
  // resolve them.
  turbopack: {
    resolveAlias: {
      "@x402/core/client": x402Stub,
      "@x402/core/server": x402Stub,
      "@x402/evm": x402Stub,
      "@x402/evm/batch-settlement/client": x402Stub,
      "@x402/evm/exact/client": x402Stub,
      "@x402/evm/exact/server": x402Stub,
      "@x402/evm/exact/v1/client": x402Stub,
      "@x402/evm/upto/client": x402Stub,
      "@x402/evm/upto/server": x402Stub,
      "@x402/express": x402Stub,
      "@x402/extensions/bazaar": x402Stub,
      "@x402/fetch": x402Stub,
      "@x402/svm/exact/client": x402Stub,
      "@x402/svm/exact/server": x402Stub,
      "@x402/svm/exact/v1/client": x402Stub,
    },
  },
};

export default nextConfig;
