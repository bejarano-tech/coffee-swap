import { MAX_FEE_PER_GAS, MAX_PRIORITY_FEE_PER_GAS, UNISWAP_SWAP_ROUTER_ADDRESS } from "@/lib/constants"
import { Percent, Token, TradeType } from "@uniswap/sdk-core"
import { MethodParameters, SwapOptions, SwapRouter, Trade } from "@uniswap/v3-sdk"
import { useCallback, useEffect, useState } from "react"
import { Config, useSendTransaction } from "wagmi"
import { SendTransactionVariables } from "wagmi/query"

export const useExecuteTrade = (trade: Trade<Token, Token, TradeType.EXACT_INPUT> | null, address: `0x${string}` | undefined) => {
  let tx: SendTransactionVariables<Config, number> & {from: `0x${string}`} | null = null;
  const { data: hash, sendTransactionAsync, error } = useSendTransaction()
  const options: SwapOptions = {
    slippageTolerance: new Percent(50, 10_000), // 50 bips, or 0.50%
    deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
    recipient: address as string,
  }

  if(trade && address){
    const { calldata, value } = SwapRouter.swapCallParameters([trade as Trade<Token, Token, TradeType.EXACT_INPUT>], options)

    tx = {
      data: calldata as `0x${string}`,
      to: UNISWAP_SWAP_ROUTER_ADDRESS as `0x${string}`,
      value: value as unknown as bigint,
      from: address as `0x${string}`,
      maxFeePerGas: BigInt(MAX_FEE_PER_GAS),
      maxPriorityFeePerGas: BigInt(MAX_PRIORITY_FEE_PER_GAS),
    };

  }

  const executeTrade = async () => {
    await sendTransactionAsync(tx as SendTransactionVariables<Config, number> & {from: `0x${string}`})
  }

  return { executeTrade }
}