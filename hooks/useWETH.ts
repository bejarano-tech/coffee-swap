import { ERC20_ABI } from "@/blockchain/abis/ERC_20";
import { WETH_TOKEN } from "@/lib/constants";
import { fromReadableAmount } from "@/lib/conversion";
import { useSimulateContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Token } from '../components/swap/SwapBox';

export const useWETH = (amountIn: number, decimals: number) => {

  const { data: depositSimulation } = useSimulateContract({
    address: WETH_TOKEN.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "deposit",
    value: fromReadableAmount(amountIn, WETH_TOKEN.decimals) as bigint
  })

  const { data: withdrawSimulation } = useSimulateContract({
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
    console.log("Deposit WETH")
    await writeContractAsync(depositSimulation!.request)
  }

  const withdraw = async () => {
    await writeContractAsync(withdrawSimulation!.request)
  }


  return { deposit, withdraw, isConfirming, isSuccess: isConfirmed, error }
};