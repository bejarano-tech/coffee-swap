import { ERC20_ABI } from "@/blockchain/abis/ERC_20"
import { useAccount, useReadContracts, useBalance } from 'wagmi';
import { Token } from '../components/Swap';
import { ETH_TOKEN } from "@/lib/constants";

export const useBalances = (tokenOne: Token, tokenTwo: Token) => {
  const { address } = useAccount()
  const ethBalance = useBalance({address})

  const tokenOneContract = {
    address: tokenOne.address as `0x${string}`,
    abi: ERC20_ABI,
  } as const

  const tokenTwoContract = {
    address: tokenTwo.address as `0x${string}`,
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

  const tokenOneBalance = (tokenOne.symbol == ETH_TOKEN.symbol) ? ethBalance.data?.value || 0 : data && data[0].result ? data[0].result : 0
  const tokenTwoBalance = (tokenTwo.symbol == ETH_TOKEN.symbol) ? ethBalance.data?.value || 0 :data && data[1].result ? data[1].result : 0

  return { tokenOneBalance, tokenTwoBalance }
}