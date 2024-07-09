import { ERC20_ABI } from "@/blockchain/abis/ERC_20";
import { WETH_TOKEN } from "@/lib/constants";
import { fromReadableAmount } from "@/lib/conversion";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

const useWETH = () => {
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

  return { deposit, isConfirming, isSuccess: isConfirmed, error }
};

export default useWETH;