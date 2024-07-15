import { ETH_TOKEN, WETH_TOKEN } from "./constants";
import { READABLE_FORM_LEN } from "./conversion";
import { Token } from '@/components/swap/SwapBox';

export const adjustNumber = (tokenOne: Token, tokenTwo: Token, input: number, decimals: number) => {

  const multiplyBy = Math.pow(10, decimals);
  
  const number = input / multiplyBy;

  if (
    (tokenOne.symbol === ETH_TOKEN.symbol &&
      tokenTwo.symbol === WETH_TOKEN.symbol) ||
    (tokenOne.symbol === WETH_TOKEN.symbol &&
      tokenTwo.symbol === ETH_TOKEN.symbol)
  ) {
    return number.toLocaleString(
      "en-US", {
        minimumFractionDigits: countDecimals(number),
        maximumFractionDigits: countDecimals(number),
      }
    );
  } else {
    return number.toLocaleString(
      "en-US", {
        minimumFractionDigits: decimals == 18 ? 6 : 2,
        maximumFractionDigits: decimals == 18 ? 6 : 2,
      }
    );
  }
};

export const formatNumber = (number: number, decimals: number = 0) => {
    const formattedNumber = number.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    return formattedNumber
}

export const localeStringToFloatString = (localeString: string) => {
  // Remove commas and leave the decimal point
  if(!localeString){
    return
  }
  const floatString = localeString.replace(/,/g, '');
  return floatString;
}

function countDecimals(value: number) {
  if (Math.floor(value) === value) return 0; // No tiene decimales
  const valueString = value.toString();
  if (valueString.includes('e-')) {
    const [base, exponent] = valueString.split('e-');
    return parseInt(exponent, 10);
  }
  return valueString.split('.')[1]?.length || 0;
}
