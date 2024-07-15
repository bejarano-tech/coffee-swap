import { useAccount, useSimulateContract, useWriteContract } from "wagmi";
import { useCreateRoute } from "./useCreateRoute";
import { useCreateTrade } from "./useCreateTrade";
import { Token } from "@uniswap/sdk-core";
import { useExecuteTrade } from "./useExecuteTrade";
import { ETH_TOKEN, SUSHISWAP_ROUTER_ADDRESS, WETH_TOKEN } from "@/lib/constants";
import { SushiSwapRouterV2Abi } from "@/blockchain/abis/SushiSwapRouterV2Abi";
import { fromReadableAmount } from "@/lib/conversion";
import { Token as SwapToken } from '@/components/swap/SwapBox';
import { useCallback } from "react";

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

  const { executeTrade: executeUniswapTrade } = useExecuteTrade(trade, address);

  const path = [token0.address, token1.address]
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutos a partir de ahora

  const { isSuccess, data: swapSimulation, isLoading: isLoadingSimulate } = useSimulateContract({
    address: SUSHISWAP_ROUTER_ADDRESS as `0x${string}`,
    abi: SushiSwapRouterV2Abi,
    functionName: "swapExactTokensForTokens",
    args: [fromReadableAmount(parseFloat(amountIn || "0"), token0.decimals), 0, path, address, deadline],
  })

  const { isPending: isWriteLoading, writeContractAsync, error, data: hash, } = useWriteContract()

  const uniswapSwap = async () => {
    await executeUniswapTrade()
  }

  const sushiswapSwap = useCallback(async () => {
    if (swapSimulation?.request) {
      await writeContractAsync(swapSimulation!.request)
      if (isSuccess) {
        console.log('approve went well')
      }
      else {
       // error
      }
    }
    }, [swapSimulation?.request, isSuccess])

  return { uniswapSwap, sushiswapSwap }
}