import { Token } from '@/components/swap/SwapBox';
import { Prices } from '@/contexts/TokenContext';
import { ETH_TOKEN, QUOTER_CONTRACT_ADDRESS_V2, SUSHISWAP_ROUTER_ADDRESS, WETH_TOKEN } from '@/lib/constants';
import { fromReadableAmount } from '@/lib/conversion';
import { useReadContract } from 'wagmi';
import QuoterV2 from '@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json';
import { FeeAmount } from '@uniswap/v3-sdk';
import { SushiSwapRouterV2Abi } from '@/blockchain/abis/SushiSwapRouterV2Abi';

export const useQuote = (  tokenOne: Token,
  tokenTwo: Token,
  amountIn: string | undefined,
  decimals: number
) => {

  const tokenOneAddress = (tokenOne.symbol == ETH_TOKEN.symbol) ? WETH_TOKEN.address : tokenOne.address
  const tokenTwoAddress = (tokenTwo.symbol == ETH_TOKEN.symbol) ? WETH_TOKEN.address : tokenTwo.address

  const { data: uniswapQuote, isLoading: isUniswapQuoteLoading, error: uniswapQuoteError } = useReadContract(
    {
      address: QUOTER_CONTRACT_ADDRESS_V2,
      abi: QuoterV2.abi,
      functionName: "quoteExactInputSingle",
      args: [
        {
          tokenIn: tokenOneAddress,
          tokenOut: tokenTwoAddress,
          fee: FeeAmount.MEDIUM,
          amountIn: fromReadableAmount(parseFloat(amountIn || "0"), decimals),
          sqrtPriceLimitX96: 0,
        },
      ],
  })

  const { data: sushiswapQuote, isLoading: isSushiQuoteLoading, error: sushiswapQuoteError } = useReadContract(
    {
      address: SUSHISWAP_ROUTER_ADDRESS,
      abi: SushiSwapRouterV2Abi,
      functionName: "getAmountsOut",
      args: [
        fromReadableAmount(parseFloat(amountIn || "0"), decimals),
        [tokenOneAddress, tokenTwoAddress],
      ],
  })

  if(uniswapQuote || sushiswapQuote){
    const uniSwapPrice = uniswapQuote ? Number((uniswapQuote as bigint[])[0]) : 0;
    const sushiSwapPrice = sushiswapQuote ? Number((sushiswapQuote as bigint[])[1]) : 0;
    const bestPrice = Math.max(uniSwapPrice, sushiSwapPrice);
    let bestDex;

    
    if (bestPrice === uniSwapPrice) {
      bestDex = "uniswap";
    } else {
      bestDex = "sushiswap";
    }

    return { uniSwapPrice, sushiSwapPrice, bestPrice, bestDex, isSushiQuoteLoading, isUniswapQuoteLoading } as Prices;
  } else {
    
    if (
      (tokenOne.symbol === ETH_TOKEN.symbol &&
        tokenTwo.symbol === WETH_TOKEN.symbol) ||
      (tokenOne.symbol === WETH_TOKEN.symbol &&
        tokenTwo.symbol === ETH_TOKEN.symbol)
    ) {
  
      return {
        uniSwapPrice: Number(
          fromReadableAmount(parseFloat(amountIn || "0"), decimals)
        ),
        sushiSwapPrice: Number(
          fromReadableAmount(parseFloat(amountIn || "0"), decimals)
        ),
        bestPrice: Number(
          fromReadableAmount(parseFloat(amountIn || "0"), decimals)
        ),
        bestDex: "",
        isSushiQuoteLoading,
        isUniswapQuoteLoading
      } as Prices;
    }

  }
  
  return { uniSwapPrice: 0, sushiSwapPrice: 0, bestPrice: 0, bestDex: "", isSushiQuoteLoading, isUniswapQuoteLoading } as Prices;
}