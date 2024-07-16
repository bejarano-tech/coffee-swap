"use server";
import {
  ETH_TOKEN,
  QUOTER_CONTRACT_ADDRESS_V2,
  SUSHISWAP_ROUTER_ADDRESS,
  UNISWAP_SWAP_ROUTER_ADDRESS,
  WETH_TOKEN,
} from "@/lib/constants";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import QuoterV2 from "@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json";
import { FeeAmount } from "@uniswap/v3-sdk";
import { fromReadableAmount } from "@/lib/conversion";
import { SushiSwapRouterV2Abi } from "@/blockchain/abis/SushiSwapRouterV2Abi";
import { ERC20_ABI } from "@/blockchain/abis/ERC_20";
import { Token } from '../components/swap/SwapBox';
import { Prices } from "@/contexts/TokenContext";

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

const SUSHISWAP_API_URL = `https://gateway-arbitrum.network.thegraph.com/api/${process.env.THE_GRAPH_API_KEY}/subgraphs/id/6NUtT5mGjZ1tSshKLf5Q3uEEJtjBZJo1TpL5MXsUBqrT`;

export const handleSushiSwapQuote = async (
  amount: string,
  direction: string,
  reverse: boolean
) => {
  if (amount == "") {
    return 0;
  }
  const query = {
    query: `
        query ($tokenIn: String!, $tokenOut: String!) {
          pairs(where: {name: "USDC-WETH"}) {
            token0Price
            token1Price
          }
        }
    `,
    variables: {
      tokenIn: "USDC",
      tokenOut: "WETH",
    },
  };

  const response = await fetch(SUSHISWAP_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
  });

  const {
    data: { pairs },
  } = await response.json();

  const { token0Price, token1Price } = pairs[0];

  const price = reverse
    ? parseFloat(amount) *
      (direction === "fromTo"
        ? parseFloat(token1Price)
        : parseFloat(token0Price))
    : parseFloat(amount) *
      (direction === "fromTo"
        ? parseFloat(token0Price)
        : parseFloat(token1Price));
  return price;
};

export const getAllowance = async (
  chain: number,
  tokenAddress: string,
  walletAddress: string,
  dex: string
) => {
  try {
    let allowance;
    if(dex === 'uniswap')
      allowance = await publicClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [walletAddress, UNISWAP_SWAP_ROUTER_ADDRESS],
      });
    else {
      allowance = await publicClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [walletAddress, SUSHISWAP_ROUTER_ADDRESS],
      });
    }
    return Number(allowance);
  } catch (error) {
    console.error(error);
    return null;
  }
};

