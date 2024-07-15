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

export const getPrices = async (
  tokenOne: Token,
  tokenTwo: Token,
  amountIn: string | undefined,
  decimals: number
) => {
  if (
    (tokenOne.symbol === ETH_TOKEN.symbol &&
      tokenTwo.symbol === WETH_TOKEN.symbol) ||
    (tokenOne.symbol === WETH_TOKEN.symbol &&
      tokenTwo.symbol === ETH_TOKEN.symbol)
  ) {


    return {
      uniSwapPrice: Number(
        fromReadableAmount(parseFloat(amountIn || "0"), decimals)
      ),
      sushiSwapPrice: Number(
        fromReadableAmount(parseFloat(amountIn || "0"), decimals)
      ),
      bestPrice: Number(
        fromReadableAmount(parseFloat(amountIn || "0"), decimals)
      ),
    };
  }

  if(tokenOne.symbol == ETH_TOKEN.symbol) {
    tokenOne.address = WETH_TOKEN.address
  }else if(tokenTwo.symbol == ETH_TOKEN.symbol){
    tokenTwo.address = WETH_TOKEN.address
  }
  
  const uniSwapQuote = (await publicClient.readContract({
    address: QUOTER_CONTRACT_ADDRESS_V2,
    abi: QuoterV2.abi,
    functionName: "quoteExactInputSingle",
    args: [
      {
        tokenIn: tokenOne.address,
        tokenOut: tokenTwo.address,
        fee: FeeAmount.MEDIUM,
        amountIn: fromReadableAmount(parseFloat(amountIn || "0"), decimals),
        sqrtPriceLimitX96: 0,
      },
    ],
  })) as bigint[];

  const sushiSwapQuote = (await publicClient.readContract({
    abi: SushiSwapRouterV2Abi,
    address: SUSHISWAP_ROUTER_ADDRESS,
    functionName: "getAmountsOut",
    args: [
      fromReadableAmount(parseFloat(amountIn || "0"), decimals),
      [tokenOne.address, tokenTwo.address],
    ],
  })) as bigint[];

  const uniSwapPrice = Number(uniSwapQuote[0]);

  const sushiSwapPrice = Number(sushiSwapQuote[1]);

  const bestPrice = Math.max(uniSwapPrice, sushiSwapPrice);

  console.log({uniSwapPrice, sushiSwapPrice, bestPrice})

  let bestDex;

  if (bestPrice === uniSwapPrice) {
    bestDex = "uniswap";
  } else {
    bestDex = "sushiswap";
  }

  return { uniSwapPrice, sushiSwapPrice, bestPrice, bestDex };
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

export const getApprove = async (
  chain: number,
  tokenAddress: string,
  amount: bigint
) => {
  const url = `https://api.1inch.dev/swap/v6.0/${chain}/approve/transaction?tokenAddress=${tokenAddress}&amount=${amount}`;

  const config = {
    headers: {
      Authorization: `Bearer ${process.env.ONE_INCH_API_KEY}`,
    },
  };

  try {
    const response = await fetch(url, config);
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};
