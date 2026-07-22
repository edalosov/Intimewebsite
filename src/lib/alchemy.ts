import { Alchemy, Network } from "alchemy-sdk";

const networkForChainId: Record<number, Network> = {
  1: Network.ETH_MAINNET,
  11155111: Network.ETH_SEPOLIA,
};

function alchemyForChain(chainId: number) {
  const network = networkForChainId[chainId];
  if (!network) throw new Error(`Unsupported chainId: ${chainId}`);
  const apiKey = process.env.ALCHEMY_API_KEY;
  if (!apiKey) throw new Error("ALCHEMY_API_KEY is not set");
  return new Alchemy({ apiKey, network });
}

export type OwnedToken = {
  tokenId: string;
  name: string;
  image: string | null;
};

export async function getOwnedTokens(
  ownerAddress: string,
  contractAddress: string,
  chainId: number,
): Promise<OwnedToken[]> {
  const alchemy = alchemyForChain(chainId);
  const response = await alchemy.nft.getNftsForOwner(ownerAddress, {
    contractAddresses: [contractAddress],
  });

  return response.ownedNfts.map((nft) => ({
    tokenId: nft.tokenId,
    name: nft.name || nft.raw?.metadata?.name || `#${nft.tokenId}`,
    image: nft.image?.cachedUrl || nft.image?.originalUrl || nft.raw?.metadata?.image || null,
  }));
}

export async function isOwnerOfToken(
  ownerAddress: string,
  contractAddress: string,
  tokenId: string,
  chainId: number,
): Promise<boolean> {
  const alchemy = alchemyForChain(chainId);
  const owners = await alchemy.nft.getOwnersForNft(contractAddress, tokenId);
  return owners.owners.some((o) => o.toLowerCase() === ownerAddress.toLowerCase());
}

export async function getTokenMetadata(
  contractAddress: string,
  tokenId: string,
  chainId: number,
): Promise<OwnedToken> {
  const alchemy = alchemyForChain(chainId);
  const nft = await alchemy.nft.getNftMetadata(contractAddress, tokenId);
  return {
    tokenId,
    name: nft.name || nft.raw?.metadata?.name || `#${tokenId}`,
    image: nft.image?.cachedUrl || nft.image?.originalUrl || nft.raw?.metadata?.image || null,
  };
}
