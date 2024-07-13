import { ERC20_ABI } from "@/blockchain/abis/ERC_20"
import { useAccount, useReadContracts, useBalance } from 'wagmi';

export const useBalances = (tokenOneAddress: string, tokenTwoAddress: string) => {
  const ethBalance = useBalance()
  const { address } = useAccount()

  const tokenOneContract = {
    address: tokenOneAddress as `0x${string}`,
    abi: ERC20_ABI,
  } as const

  const tokenTwoContract = {
    address: tokenTwoAddress as `0x${string}`,
    abi: ERC20_ABI,
  } as const

  const { data } = useReadContracts({
    contracts: [
      {
        ...tokenOneContract,
        functionName: 'balanceOf',
        args: [address]
      },
      {
        ...tokenTwoContract,
        functionName: 'balanceOf',
        args: [address]
      }
    ]
  })

  const tokenOneBalance = data && data[0].result ? data[0].result : 0
  const tokenTwoBalance = data && data[1].result ? data[1].result : 0

  console.log(data)

  return { ethBalance: ethBalance.data, tokenOneBalance, tokenTwoBalance }
}