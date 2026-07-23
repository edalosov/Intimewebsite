import { getOwnedTokens, getTokenMetadata, resolveTokenOwner, type OwnedToken } from "@/lib/alchemy";
import { getDelegatedAccess } from "@/lib/delegateRegistry";

// Every token `walletAddress` can see: ones it holds directly, plus ones
// held by any vault that has delegated this collection (or everything) to
// it via delegate.xyz.
export async function resolveAccessibleTokens(
  walletAddress: string,
  contractAddress: string,
  chainId: number,
): Promise<OwnedToken[]> {
  const tokens = new Map<string, OwnedToken>();

  const direct = await getOwnedTokens(walletAddress, contractAddress, chainId);
  for (const token of direct) tokens.set(token.tokenId, token);

  const { delegatedVaults, delegatedTokens } = await getDelegatedAccess(
    walletAddress,
    contractAddress,
    chainId,
  );

  for (const vault of delegatedVaults) {
    const vaultTokens = await getOwnedTokens(vault, contractAddress, chainId);
    for (const token of vaultTokens) tokens.set(token.tokenId, token);
  }

  for (const { vault, tokenId } of delegatedTokens) {
    if (tokens.has(tokenId)) continue;
    // Delegation records don't disappear the instant an NFT changes hands —
    // re-confirm current ownership before trusting a single-token grant.
    const owner = await resolveTokenOwner(contractAddress, tokenId, chainId);
    if (owner !== vault) continue;
    tokens.set(tokenId, await getTokenMetadata(contractAddress, tokenId, chainId));
  }

  return [...tokens.values()];
}

export type TokenAccess = { allowed: boolean; ownerAddress: string | null };

// Can `walletAddress` view/answer for `tokenId` — either because it holds
// the token directly, or because the actual holder has delegated it (or the
// whole collection, or everything) to this wallet via delegate.xyz?
export async function resolveTokenAccess(
  walletAddress: string,
  contractAddress: string,
  tokenId: string,
  chainId: number,
): Promise<TokenAccess> {
  const wallet = walletAddress.toLowerCase();
  const ownerAddress = await resolveTokenOwner(contractAddress, tokenId, chainId);
  if (!ownerAddress) return { allowed: false, ownerAddress: null };

  if (ownerAddress === wallet) {
    return { allowed: true, ownerAddress };
  }

  const { delegatedVaults, delegatedTokens } = await getDelegatedAccess(wallet, contractAddress, chainId);
  const allowed =
    delegatedVaults.includes(ownerAddress) ||
    delegatedTokens.some((d) => d.vault === ownerAddress && d.tokenId === tokenId);

  return { allowed, ownerAddress };
}
