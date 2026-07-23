import { createPublicClient, http } from "viem";
import { mainnet, sepolia } from "wagmi/chains";

// Deployed at the same address on Ethereum mainnet, Sepolia, and most other
// EVM chains (deterministic CREATE2 deployment). See
// https://github.com/delegatexyz/delegate-registry
const DELEGATE_REGISTRY_ADDRESS = "0x00000000000000447e69651d841bd8d104bed493" as const;

// DelegationType enum from IDelegateRegistry.sol — order is load-bearing,
// Solidity enums are numbered by declaration order.
const DELEGATION_TYPE = {
  NONE: 0,
  ALL: 1,
  CONTRACT: 2,
  ERC721: 3,
  ERC20: 4,
  ERC1155: 5,
} as const;

const delegateRegistryAbi = [
  {
    type: "function",
    name: "getIncomingDelegations",
    stateMutability: "view",
    inputs: [{ name: "to", type: "address" }],
    outputs: [
      {
        name: "delegations",
        type: "tuple[]",
        components: [
          { name: "type_", type: "uint8" },
          { name: "to", type: "address" },
          { name: "from", type: "address" },
          { name: "rights", type: "bytes32" },
          { name: "contract_", type: "address" },
          { name: "tokenId", type: "uint256" },
          { name: "amount", type: "uint256" },
        ],
      },
    ],
  },
] as const;

function alchemyRpcUrl(chainId: number) {
  const apiKey = process.env.ALCHEMY_API_KEY;
  if (!apiKey) throw new Error("ALCHEMY_API_KEY is not set");

  if (chainId === mainnet.id) return `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`;
  if (chainId === sepolia.id) return `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`;
  throw new Error(`Unsupported chainId: ${chainId}`);
}

function publicClientForChain(chainId: number) {
  const chain = chainId === mainnet.id ? mainnet : sepolia;
  return createPublicClient({ chain, transport: http(alchemyRpcUrl(chainId)) });
}

export type DelegatedAccess = {
  // Vaults that delegated this whole contract (or everything) to the hot wallet.
  delegatedVaults: string[];
  // Vaults that delegated one specific token to the hot wallet.
  delegatedTokens: { vault: string; tokenId: string }[];
};

// What has `hotWallet` been delegated access to, for `contractAddress`, by
// anyone? Only ever needs the hot wallet's address — delegate.xyz's registry
// is queryable by the recipient without knowing the vault in advance.
export async function getDelegatedAccess(
  hotWallet: string,
  contractAddress: string,
  chainId: number,
): Promise<DelegatedAccess> {
  const client = publicClientForChain(chainId);
  const delegations = await client.readContract({
    address: DELEGATE_REGISTRY_ADDRESS,
    abi: delegateRegistryAbi,
    functionName: "getIncomingDelegations",
    args: [hotWallet as `0x${string}`],
  });

  const delegatedVaults = new Set<string>();
  const delegatedTokens: { vault: string; tokenId: string }[] = [];
  const targetContract = contractAddress.toLowerCase();

  for (const d of delegations) {
    if (d.type_ === DELEGATION_TYPE.ALL) {
      delegatedVaults.add(d.from.toLowerCase());
      continue;
    }
    if (d.contract_.toLowerCase() !== targetContract) continue;

    if (d.type_ === DELEGATION_TYPE.CONTRACT) {
      delegatedVaults.add(d.from.toLowerCase());
    } else if (d.type_ === DELEGATION_TYPE.ERC721) {
      delegatedTokens.push({ vault: d.from.toLowerCase(), tokenId: d.tokenId.toString() });
    }
  }

  return { delegatedVaults: [...delegatedVaults], delegatedTokens };
}
