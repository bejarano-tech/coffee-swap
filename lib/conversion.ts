import { BigNumberish, formatUnits, parseUnits } from 'ethers'

const READABLE_FORM_LEN = 9

export function fromReadableAmount(
  amount: number,
  decimals: number
): BigNumberish {
  return parseUnits(amount.toString(), decimals)
}

export function toReadableAmount(rawAmount: number, decimals: number): string {
  return formatUnits(rawAmount, decimals)
    .slice(0, READABLE_FORM_LEN)
}