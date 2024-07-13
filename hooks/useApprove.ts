import { ERC20_ABI } from "@/blockchain/abis/ERC_20"
import { Token } from "@uniswap/sdk-core"
import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi"

export const useApprove = () => {
  const { writeContractAsync: approve, error, data: hash, isPending } = useWriteContract()

  const { isLoading: isApproving, isSuccess: isApproved } = useWaitForTransactionReceipt({
      hash,
  })

  return { approve, error, isApproved, isApproving }
}