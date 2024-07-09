import { MAX_FEE_PER_GAS, MAX_PRIORITY_FEE_PER_GAS, SWAP_ROUTER_ADDRESS } from "@/lib/constants"
import { Percent, Token, TradeType } from "@uniswap/sdk-core"
import { MethodParameters, SwapOptions, SwapRouter, Trade } from "@uniswap/v3-sdk"
import { useCallback, useEffect, useState } from "react"
import { useSendTransaction } from "wagmi"

export const useExecuteTrade = (trade: Trade<Token, Token, TradeType.EXACT_INPUT> | null, address: `0x${string}` | undefined) => {

  const [methodParameters, setMethodParameters] = useState<MethodParameters | null>(null)

  const options: SwapOptions = {
    slippageTolerance: new Percent(50, 10_000), // 50 bips, or 0.50%
    deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
    recipient: address as string,
  }
  
  useEffect(()=> {
    if(trade){
      setMethodParameters(SwapRouter.swapCallParameters([trade as Trade<Token, Token, TradeType.EXACT_INPUT>], options))
    }
  }, [trade])

  const tx = {
    data: methodParameters?.calldata,
    to: SWAP_ROUTER_ADDRESS,
    value: methodParameters?.value,
    from: address,
    maxFeePerGas: MAX_FEE_PER_GAS,
    maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
  }

  const { data: hash, sendTransaction } = useSendTransaction()

  const executeTrade = () => {
    sendTransaction(tx)
  }

  return { executeTrade }
}