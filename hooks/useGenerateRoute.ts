import {
  AlphaRouter,
  SwapOptionsSwapRouter02,
  SwapType,
} from '@uniswap/smart-order-router'
import { createPublicClient, http } from 'viem'
import { mainnet } from 'wagmi/chains'
import { BaseProvider } from '@ethersproject/providers'
import { CurrencyAmount, Percent, Token, TradeType } from '@uniswap/sdk-core'
import { fromReadableAmount } from '@/lib/conversion'

export const useGenerateRoute = (address: `0x${string}`, tokenIn: Token, tokenOut: Token, amountIn: number) => {
  const getRoute = async () => {
    const client = createPublicClient({ 
      chain: mainnet, 
      transport: http('https://cloudflare-eth.com') 
    }) 
  
    const router = new AlphaRouter({
      chainId: mainnet.id,
      provider: client as unknown as BaseProvider,
    })
  
    const options: SwapOptionsSwapRouter02 = {
      recipient: address,
      slippageTolerance: new Percent(50, 10_000),
      deadline: Math.floor(Date.now() / 1000 + 1800),
      type: SwapType.SWAP_ROUTER_02,
    }
  
    const route = await router.route(
      CurrencyAmount.fromRawAmount(
        tokenIn,
        fromReadableAmount(
          amountIn,
          tokenIn.decimals
        ).toString()
      ),
      tokenOut,
      TradeType.EXACT_INPUT,
      options
    )
  
    return route
  }

  return { getRoute }
}