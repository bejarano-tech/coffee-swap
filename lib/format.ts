export const adjustNumber = (input: number, decimals: number) => {
  const multiplyBy = 1 / Math.pow(10, decimals);

  const number = input * multiplyBy;

  return number;
}

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