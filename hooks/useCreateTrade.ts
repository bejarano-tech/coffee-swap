import {
  QUOTER_CONTRACT_ADDRESS_V2
} from "@/lib/constants";
import { fromReadableAmount } from "@/lib/conversion";
import { CurrencyAmount, Token, TradeType } from "@uniswap/sdk-core";
import { Route, Trade } from "@uniswap/v3-sdk";
import { AbiCoder } from "ethers";
import { useCall } from "wagmi";

export const useCreateTrade = (
  tokenIn: Token,
  tokenOut: Token,
  calldata: string,
  swapRoute: Route<Token, Token> | undefined,
  amount: number,
) => {
  const { data } = useCall({
    data:
      (calldata as `0x${string}`) ||
      "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    to: QUOTER_CONTRACT_ADDRESS_V2,
  });

  const getTrade = () => {
    try {
      const abiCoder = AbiCoder.defaultAbiCoder();
      const decoded = abiCoder.decode(["uint256"], data?.data as `0x${string}`);

      const uncheckedTrade = Trade.createUncheckedTrade({
        route: swapRoute as Route<Token, Token>,
        inputAmount: CurrencyAmount.fromRawAmount(
          tokenIn,
          fromReadableAmount(amount, tokenIn.decimals).toString()
        ),
        outputAmount: CurrencyAmount.fromRawAmount(
          tokenOut,
          BigInt(decoded[0]).toString(),
        ),
        tradeType: TradeType.EXACT_INPUT,
      });

      return uncheckedTrade
    } catch (error) {
      console.log(error)
      return null
    }
  }
  return { getTrade }
};
