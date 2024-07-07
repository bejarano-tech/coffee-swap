import { QUOTER_CONTRACT_ADDRESS } from "@/lib/constants";
import { fromReadableAmount } from "@/lib/conversion";
import { adjustNumber } from "@/lib/format";
import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";
import { FeeAmount } from "@uniswap/v3-sdk";
import { useSimulateContract } from "wagmi";

export const useQuote = (
  tokenIn: string,
  tokenOut: string,
  amountIn: number,
  zeroCount: number,
  decimals: number
) => {
  const adjustedAmount =
    tokenIn == "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
      ? fromReadableAmount(amountIn, 18)
      : BigInt(amountIn);

  const { data, isLoading, error } = useSimulateContract({
    abi: Quoter.abi,
    address: QUOTER_CONTRACT_ADDRESS,
    functionName: "quoteExactOutputSingle",
    args: [tokenIn, tokenOut, FeeAmount.MEDIUM, adjustedAmount, 0],
  });

  const amount = data?.result
    ? adjustNumber(Number(data?.result || 0), zeroCount)
    : 0;

  return { quotedAmountOut: amount, isLoading };
};