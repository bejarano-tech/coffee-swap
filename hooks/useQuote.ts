import { QUOTER_CONTRACT_ADDRESS } from "@/lib/constants";
import { fromReadableAmount } from "@/lib/conversion";
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
    args: [
      tokenIn,
      tokenOut,
      FeeAmount.MEDIUM,
      adjustedAmount,
      0,
    ],
  });

  const amount = data?.result ? formatNumber(Number(data?.result || 0), zeroCount, decimals) : "0";

  return { quotedAmountOut: amount, isLoading };
};

function formatNumber(input: number, zeroCount: number, decimals: number = 0) {
  // Crear el factor de multiplicación basado en la cantidad de ceros decimales
  const multiplyBy = 1 / Math.pow(10, zeroCount);

  // Multiplicar el número según el factor calculado
  const number = input * multiplyBy;

  // Formatear el número con dos decimales y separadores de miles
  const formattedNumber = number.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return formattedNumber;
}
