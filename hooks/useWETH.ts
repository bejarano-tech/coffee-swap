import { ERC20_ABI } from "@/blockchain/abis/ERC_20";
import { WETH_TOKEN } from "@/lib/constants";
import { fromReadableAmount, toReadableAmount } from "@/lib/conversion";
import { Token } from "@uniswap/sdk-core";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

export const useWETH = () => {
  const { writeContractAsync, error, data: hash } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
  useWaitForTransactionReceipt({
    hash,
  })

  const deposit = async (amountIn: number) => {
    await writeContractAsync({
      address: WETH_TOKEN.address as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "deposit",
      value: fromReadableAmount(amountIn, WETH_TOKEN.decimals) as bigint
    })
  }

  const withdraw = async (amountIn: number) => {
    console.log({error})
    await writeContractAsync({
      address: WETH_TOKEN.address as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "withdraw",
      args: [BigInt(amountIn)]
    })
  }

  return { deposit, withdraw, isConfirming, isSuccess: isConfirmed, error }
};