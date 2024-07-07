export const adjustNumber = (input: number, zeroCount: number) => {
  const multiplyBy = 1 / Math.pow(10, zeroCount);

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