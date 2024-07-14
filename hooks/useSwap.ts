import { useAccount } from "wagmi";
import { useCreateRoute } from "./useCreateRoute";
import { useCreateTrade } from "./useCreateTrade";
import { Token as SwapToken} from "@/components/Swap";
import { Token } from "@uniswap/sdk-core";
import { useExecuteTrade } from "./useExecuteTrade";
import { useCallback } from "react";
import { ETH_TOKEN, WETH_TOKEN } from "@/lib/constants";

export const useSwap = (tokenOne: SwapToken, tokenTwo: SwapToken, amountIn: string) => {
  const { chainId, address } = useAccount()

  const token0Object = (tokenOne.symbol == ETH_TOKEN.symbol && tokenTwo.symbol != WETH_TOKEN.symbol ? WETH_TOKEN : tokenOne)
  const token1Object = (tokenTwo.symbol == ETH_TOKEN.symbol && tokenOne.symbol != WETH_TOKEN.symbol ? WETH_TOKEN : tokenTwo)

  const token0 = new Token(
    chainId as number || 1,
    token0Object.address,
    tokenOne.decimals,
    token0Object.symbol,
    token0Object.name
  )

  const token1 = new Token(
    chainId as number || 1,
    token1Object.address,
    tokenTwo.decimals,
    token1Object.symbol,
    token1Object.name
  )

  console.log({token0, token1})

  const { calldata, swapRoute } = useCreateRoute(
    token0,
    token1,
    parseFloat(amountIn || "0")
  );
  const { getTrade } = useCreateTrade(
    token0,
    token1,
    calldata as string,
    swapRoute,
    parseFloat(amountIn || "0")
  );

  const trade = getTrade()

  const { executeTrade } = useExecuteTrade(trade, address);

  const swap = async () => {
    await executeTrade()
  }

  return { swap }
}