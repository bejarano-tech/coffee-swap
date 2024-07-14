import { CurrencyAmount, Token, TradeType } from "@uniswap/sdk-core"
import { BLANK_TOKEN, ETH_TOKEN, POOL_FACTORY_CONTRACT_ADDRESS } from '@/lib/constants';
import { computePoolAddress, FeeAmount, Pool, Route, SwapQuoter } from "@uniswap/v3-sdk";
import { http, useCall, useReadContract } from "wagmi";
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import { fromReadableAmount } from "@/lib/conversion";
import { call } from '@wagmi/core'
import { config } from "@/wagmi";
import { mainnet } from "wagmi/chains";
import { createPublicClient } from "viem";

export const useCreateRoute = (tokenIn: Token, tokenOut: Token, amountIn: number) => {

  
  const currentPoolAddress = computePoolAddress({
    factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
    tokenA: tokenIn,
    tokenB: tokenOut,
    fee: FeeAmount.MEDIUM,
  }) as `0x${string}`
  
  const { data: fee } = useReadContract({
    address: currentPoolAddress,
    abi: IUniswapV3PoolABI.abi,
    functionName: 'fee',    
  })
  const { data: tickSpacing } = useReadContract({
    address: currentPoolAddress,
    abi: IUniswapV3PoolABI.abi,
    functionName: 'tickSpacing',    
  })
  const { data: liquidity } = useReadContract({
    address: currentPoolAddress,
    abi: IUniswapV3PoolABI.abi,
    functionName: 'liquidity',    
  })
  const { data: slot } = useReadContract({
    address: currentPoolAddress,
    abi: IUniswapV3PoolABI.abi,
    functionName: 'slot0',    
  })

  if(!slot) {
    return { calldata: null }
  }

  const slotTyped = slot as [bigint, number]
  const sqrtRatioX96 = (slotTyped && slotTyped.length > 0 ? slotTyped[0] : 0)
  const ticks = (slotTyped && slotTyped.length > 0 ? slotTyped[1] : 0)

  const pool = new Pool(
    tokenIn,
    tokenOut,
    FeeAmount.MEDIUM,
    sqrtRatioX96.toString(),
    (liquidity ? liquidity : 0  ).toString(),
    ticks
  )

  
  const swapRoute = new Route(
    [pool],
    tokenIn,
    tokenOut
  )

  const { calldata } = SwapQuoter.quoteCallParameters(
    swapRoute,
    CurrencyAmount.fromRawAmount(
      tokenIn,
      fromReadableAmount(
        amountIn,
        tokenIn.decimals
      ).toString()
    ),
    TradeType.EXACT_INPUT,
    {
      useQuoterV2: true,
    }
  )

  return { calldata, swapRoute }
}