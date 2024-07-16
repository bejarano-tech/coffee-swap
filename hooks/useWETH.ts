import { ERC20_ABI } from "@/blockchain/abis/ERC_20";
import { WETH_TOKEN } from "@/lib/constants";
import { fromReadableAmount } from "@/lib/conversion";
import { useSimulateContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Token } from '../components/swap/SwapBox';
import { useCallback } from "react";

export const useWETH = (amountIn: number, decimals: number) => {

  const { data: depositSimulation } = useSimulateContract({
    address: WETH_TOKEN.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "deposit",
    value: fromReadableAmount(amountIn, WETH_TOKEN.decimals) as bigint
  })

  const { data: withdrawSimulation, isSuccess } = useSimulateContract({
      address: WETH_TOKEN.address as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "withdraw",
      args: [fromReadableAmount(amountIn, decimals)]
    })

  const { writeContractAsync, error, data: hash } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
  useWaitForTransactionReceipt({
    hash,
  })

  const deposit = async () => {
    try {
      await writeContractAsync(depositSimulation!.request)
    } catch (error) {
      console.log(error)
    }
  }

  const withdraw = useCallback(async () => {
    try {
      if (withdrawSimulation?.request) {
        await writeContractAsync(withdrawSimulation!.request)
        if (isSuccess) {
          console.log('approve went well')
        }
        else {
          console.log("error withdrawing")
        }
      }      
    } catch (error) {
      console.log(error)
    }
    }, [withdrawSimulation?.request, isSuccess])

  return { deposit, withdraw, isConfirming, isSuccess: isConfirmed, error }
};