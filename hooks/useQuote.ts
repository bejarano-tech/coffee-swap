import { QUOTER_CONTRACT_ADDRESS_V2 } from "@/lib/constants";
import { fromReadableAmount } from "@/lib/conversion";
import { adjustNumber } from "@/lib/format";
import QuoterV2 from "@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json";
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
    tokenIn == "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
      ? fromReadableAmount(amountIn, 18)
      : BigInt(Number(amountIn.toString().split('.').join('')));

  const { data, isLoading, error } = useSimulateContract({
    abi: QuoterV2.abi,
    address: QUOTER_CONTRACT_ADDRESS_V2,
    functionName: "quoteExactInputSingle",
    args: [{tokenIn, tokenOut, fee: FeeAmount.MEDIUM, amountIn: adjustedAmount, sqrtPriceLimitX96: 0}],
  });

  const amount = data?.result
    ? adjustNumber(Number(data?.result[0] || 0), zeroCount)
    : 0;

  return { quotedAmountOut: amount, isLoading };
};