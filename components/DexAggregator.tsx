"use client";
import { SetStateAction, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useQuote } from "@/hooks/useQuote";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { handleSushiSwapQuote } from "@/app/actions";
import { formatNumber } from "@/lib/format";

interface Dex {
  address: string;
  abi: any[];
}

const tokenList = [
  {
    name: "Wrapped Ether",
    symbol: "WETH",
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    zeroCount: 12,
    decimals: 6
  },
  {
    name: "USD//C",
    symbol: "USDC",
    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    zeroCount: 6,
    decimals: 2
  }
];

export const DexAggregator = () => {
  const { isConnected } = useAccount();
  const [fromToken, setFromToken] = useState(tokenList[0].address);
  const [toToken, setToToken] = useState(tokenList[1].address);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [direction, setDirection] = useState("fromTo");
  const [reverse, setReverse] = useState(false)
  const [bestDex, setBestDex] = useState("");
  const [amount, setAmount] = useState("0");

  const fromTokenZeroCount = tokenList.find(token => token.address === fromToken)?.zeroCount || 18;
  const toTokenZeroCount = tokenList.find(token => token.address === toToken)?.zeroCount || 18;

  const fromTokenDecimals = tokenList.find(token => token.address === fromToken)?.decimals || 18;
  const toTokenDecimals = tokenList.find(token => token.address === toToken)?.decimals || 18;

  const { quotedAmountOut: uniswapPrice } = useQuote(
    (direction === 'fromTo' ? fromToken : toToken),
    (direction === 'fromTo' ? toToken : fromToken),
    parseFloat(amount || "0"),
    direction === 'fromTo' ? toTokenZeroCount : fromTokenZeroCount,
    direction === 'fromTo' ? toTokenDecimals : fromTokenDecimals,
  );

  useEffect(() => {
    const updateViews = async () => {
      const sushiSwapPrice = await handleSushiSwapQuote(amount, direction, reverse)
      
      const bestPrice = Math.min(uniswapPrice, sushiSwapPrice)
      if (bestPrice == 0) {
        return
      }
      let bestDexName = "";
      if (bestPrice === uniswapPrice) {
        bestDexName = "Uniswap";
      } else {
        bestDexName = "SushiSwap";
      }

      setBestDex(bestDexName);
      if (direction == 'fromTo') {
          setToAmount(formatNumber(bestPrice, toTokenDecimals))
      } else {
        setFromAmount(formatNumber(bestPrice, fromTokenDecimals))
      }
    }
    updateViews()
  }, [amount, direction, fromTokenDecimals, reverse, toTokenDecimals, uniswapPrice])

  useEffect(() => {
    setAmount((direction === 'fromTo') ? fromAmount : toAmount)
  }, [fromAmount, toAmount])


  const handleSwap = async () => {};

  const handleFromAmountChange = (event: { target: { value: SetStateAction<string>; }; }) => {
    setDirection('fromTo')
    const { value } = event.target
    const formated = (value as string).split(',').join('')
    setFromAmount(formated)
    setBestDex("")
  }

  const handleToAmountChange = (event: { target: { value: SetStateAction<string>; }; }) => {
    setDirection('toFrom')
    const { value } = event.target
    const formated = (value as string).split(',').join('')
    setToAmount(formated)
    setBestDex("")
  }

  const handleFromTokenChange = (value: string) => {
    const from = fromToken;
    setToToken("0xa000000000000000000000000000000000000000")
    setFromToken(value)
    setToToken(from)
    setFromAmount("")
    setToAmount("")
    setReverse(!reverse)
    setBestDex("")
  }

  const handleToTokenChange = (value: string) => {
    const to = toToken;
    setFromToken("0xa000000000000000000000000000000000000000")
    setToToken(value)
    setFromToken(to)
    setFromAmount("")
    setToAmount("")
    setReverse(!reverse)
    setBestDex("")
  }

  return (
    <main className="flex-grow flex items-center justify-center p-4">
      {isConnected ? (
        <div className="bg-gray-200 p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6">Swap Tokens</h2>
          <Label htmlFor="fromToken">From</Label>
          <div id="fromToken" className="mb-4 flex">
            <Input type="text" placeholder="0" value={fromAmount} onChange={handleFromAmountChange} />
            <Select onValueChange={handleFromTokenChange} value={fromToken}>
              <SelectTrigger className="w-[180px]">
                <SelectValue className="text-black" />
              </SelectTrigger>
              <SelectContent>
                {tokenList.map((token) => (
                  <SelectItem key={token.symbol} value={token.address}>
                    {token.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Label htmlFor="fromToken">To</Label>
          <div id="fromToken" className="mb-4 flex">
            <Input type="text" placeholder="0" value={toAmount} onChange={handleToAmountChange} />
            <Select onValueChange={handleToTokenChange} value={toToken}>
              <SelectTrigger className="w-[180px]">
                <SelectValue className="text-black" />
              </SelectTrigger>
              <SelectContent>
                {tokenList.map((token) => (
                  <SelectItem key={token.symbol} value={token.address}>
                    {token.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4">
            <p>Best price found on: {bestDex}</p>
          </div>
          <Button
            // disabled={quotedAmountOut === '0'}
            onClick={handleSwap}
            className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Swap
          </Button>
        </div>
      ) : (
        <ConnectButton />
      )}
    </main>
  );
};
