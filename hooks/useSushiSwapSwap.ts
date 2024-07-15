import { SushiSwapRouterV2Abi } from "@/blockchain/abis/SushiSwapRouterV2Abi";
import { SUSHISWAP_ROUTER_ADDRESS } from "@/lib/constants";
import { fromReadableAmount } from "@/lib/conversion";
import { adjustNumber } from "@/lib/format";
import { Token } from "@uniswap/sdk-core";
import { FeeAmount } from "@uniswap/v3-sdk";
import { useSimulateContract } from "wagmi";

export const useSushiSwapQuote = (
  tokenIn: Token,
  tokenOut: Token,
  amountIn: number,
  zeroCount: number,
) => {

  const path = [tokenIn.address, tokenOut.address]

  const { data, isLoading, error } = useSimulateContract({
    abi: SushiSwapRouterV2Abi,
    address: SUSHISWAP_ROUTER_ADDRESS,
    functionName: "getAmountsOut",
    args: [fromReadableAmount(amountIn, tokenIn.decimals), path],
    query: {
      enabled: (amountIn != 0)
    }
  });

  const amount = data?.result[1]
  ? adjustNumber(Number(data?.result[1] || 0), tokenOut.decimals)
  : 0;

  return { quotedAmountOut: amount, isLoading };
};