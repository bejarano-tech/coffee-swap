import { ERC20_ABI } from "@/blockchain/abis/ERC_20"
import { Token } from "@uniswap/sdk-core"
import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi"

export const useApprove = (token: Token) => {
  const { writeContractAsync: approve, error, data: hash, isPending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
      hash,
  })  

  return { approve, error, isConfirmed }
}