import { Token } from "@uniswap/sdk-core"
import { BigNumber } from '@ethersproject/bignumber';

export const POOL_FACTORY_CONTRACT_ADDRESS =
  '0x1F98431c8aD98523631AE4a59f267346ea31F984'
export const QUOTER_CONTRACT_ADDRESS =
  '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'
  export const QUOTER_CONTRACT_ADDRESS_V2 =
  '0x61fFE014bA17989E743c5F6cB21bF9697530B21e'

export const SUSHISWAP_ROUTER_ADDRESS = '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F'

export const SWAP_ROUTER_ADDRESS = '0xE592427A0AEce92De3Edee1F18E0157C05861564'

export class ExtendedToken extends Token {
  zeroCount: number;

  constructor(zeroCount: number, chainId: number, address: string, decimals: number, symbol?: string, name?: string, bypassChecksum?: boolean, buyFeeBps?: BigNumber, sellFeeBps?: BigNumber) {
    super(chainId, address, decimals, symbol, name, bypassChecksum, buyFeeBps, sellFeeBps);
    this.zeroCount = zeroCount;
  }
}

export const DAI_TOKEN = new Token(
  12,
  '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  18,
  'DAI',
  'Dai Stablecoin'
)

export const WETH_TOKEN = new ExtendedToken(
  12,
  12,
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  18,
  'WETH',
  'Wrapped Ether'
)

export const USDC_TOKEN = new ExtendedToken(
  6,
  12,
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  6,
  'USDC',
  'USD//C'
)

export const BLANK_TOKEN = new ExtendedToken(
  12,
  12,
  '0xa000000000000000000000000000000000000000',
  6,
  'Blank Token',
  'BLANK'
)

export const tokenList = [
  WETH_TOKEN,
  USDC_TOKEN,
  BLANK_TOKEN
]

export const TOKEN_AMOUNT_TO_APPROVE_FOR_TRANSFER = 2000

export const MAX_FEE_PER_GAS = 100000000000
export const MAX_PRIORITY_FEE_PER_GAS = 100000000000