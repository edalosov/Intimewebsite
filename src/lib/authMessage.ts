export function buildSignInMessage(params: { walletAddress: string; timestamp: number }) {
  return [
    "Sign in to Unfinished Past Gallery",
    "",
    "This confirms you control this wallet. No transaction, no gas.",
    "",
    `Address: ${params.walletAddress}`,
    `Timestamp: ${new Date(params.timestamp).toISOString()}`,
  ].join("\n");
}
