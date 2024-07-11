import { QUOTER_CONTRACT_ADDRESS_V2 } from "@/lib/constants";
import { fromReadableAmount } from "@/lib/conversion";
import { adjustNumber } from "@/lib/format";
import { Token } from "@uniswap/sdk-core";
import QuoterV2 from "@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json";
import { FeeAmount } from "@uniswap/v3-sdk";
import { useSimulateContract } from "wagmi";

export const useQuote = (
  tokenIn: Token,
  tokenOut: Token,
  amountIn: number,
  zeroCount: number,
) => {
  const { data, isLoading, error } = useSimulateContract({
    abi: QuoterV2.abi,
    address: QUOTER_CONTRACT_ADDRESS_V2,
    functionName: "quoteExactInputSingle",
    args: [
      {
        tokenIn: tokenIn.address,
        tokenOut: tokenOut.address,
        fee: FeeAmount.MEDIUM,
        amountIn: fromReadableAmount(amountIn, tokenIn.decimals),
        sqrtPriceLimitX96: 0,
      },
    ],
    query: {
      enabled: (amountIn != 0)
    }
  });

  const amount = data?.result
    ? adjustNumber(Number(data?.result[0] || 0), tokenOut.decimals)
    : 0;

  return { quotedAmountOut: amount, isLoading };
};
