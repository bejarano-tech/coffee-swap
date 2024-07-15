import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function countDecimals(value: number) {
  if (Math.floor(value) === value) return 0;
  return value.toString().split('.')[1].length || 0;
}
