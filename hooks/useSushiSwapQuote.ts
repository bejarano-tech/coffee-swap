import { SushiSwapRouterV2Abi } from "@/blockchain/abis/SushiSwapRouterV2Abi";
import { SUSHISWAP_ROUTER_ADDRESS } from "@/lib/constants";
import { fromReadableAmount } from "@/lib/conversion";
import { adjustNumber } from "@/lib/format";
import { FeeAmount } from "@uniswap/v3-sdk";
import { useSimulateContract } from "wagmi";

export const useSushiSwapQuote = (
  tokenIn: string,
  tokenOut: string,
  amountIn: number,
  zeroCount: number,
) => {
  const adjustedAmount =
  tokenIn == "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
  ? fromReadableAmount(amountIn, 18)
  : BigInt(Number(amountIn.toString().split('.').join('')));
  
  const path = [tokenIn, tokenOut]

  const { data, isLoading, error } = useSimulateContract({
    abi: SushiSwapRouterV2Abi,
    address: SUSHISWAP_ROUTER_ADDRESS,
    functionName: "getAmountsOut",
    args: [adjustedAmount, path],
  });

  console.log(data?.result)

  const amount = data?.result[1]
  ? adjustNumber(Number(data?.result[1] || 0), zeroCount)
  : 0;
  
  console.log('Sushi', { amount, adjustedAmount, tokenIn, tokenOut })
  return { quotedAmountOut: amount, isLoading };
};