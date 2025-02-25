import { BigNumberish, formatUnits, parseUnits } from 'ethers'
import Big from 'big.js';
export const READABLE_FORM_LEN = 10

export function fromReadableAmount(
  amount: number,
  decimals: number
): BigNumberish {

  return parseUnits(roundToDecimals(amount.toString(), decimals), decimals)
}

export function toReadableAmount(rawAmount: number, decimals: number): string {
  return formatUnits(rawAmount, decimals)
    .slice(0, READABLE_FORM_LEN)
}

const roundToDecimals = (value: string, decimals: number): string => {
  const bigValue = new Big(value);
  return bigValue.toFixed(decimals);
};