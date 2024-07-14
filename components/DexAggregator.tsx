"use client";
import { SetStateAction, useCallback, useEffect, useState } from "react";
import { useAccount, useBalance, useCall, useReadContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useQuote } from "@/hooks/useQuote";
import { Input } from "./ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { adjustNumber, formatNumber, localeStringToFloatString } from "@/lib/format";
import {
  BLANK_TOKEN,
  ExtendedToken,
  SWAP_ROUTER_ADDRESS,
  tokenList,
  USDC_TOKEN,
  WETH_TOKEN,
} from "@/lib/constants";
import { useCreateRoute } from "@/hooks/useCreateRoute";
import { useCreateTrade } from "@/hooks/useCreateTrade";
import { useApprove } from "@/hooks/useApprove";
import { ERC20_ABI } from "@/blockchain/abis/ERC_20";
import { fromReadableAmount } from "@/lib/conversion";
import { Trade } from "@uniswap/v3-sdk";
import { Token, TradeType } from "@uniswap/sdk-core";
import { useExecuteTrade } from "@/hooks/useExecuteTrade";
import { useWETH } from "@/hooks/useWETH";
import { format } from "path";
import { useSushiSwapQuote } from "@/hooks/useSushiSwapQuote";
import { Settings } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

export const DexAggregator = () => {
  const { isConnected, address, chainId } = useAccount();
  const { data: ethBalance } = useBalance({
    address,
  });
  const [fromToken, setFromToken] = useState(tokenList[0]);
  const [toToken, setToToken] = useState(tokenList[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [direction, setDirection] = useState("fromTo");
  const [reverse, setReverse] = useState(false);
  const [bestDex, setBestDex] = useState<string | null>(null);
  const [amount, setAmount] = useState("0");
  const [trade, setTrade] = useState<Trade<
    Token,
    Token,
    TradeType.EXACT_INPUT
  > | null>(null);

  const fromTokenZeroCount =
    tokenList.find((token) => token.address === fromToken.address)?.zeroCount ||
    18;
  const toTokenZeroCount =
    tokenList.find((token) => token.address === toToken.address)?.zeroCount ||
    18;

  const fromTokenDecimals =
    tokenList.find((token) => token.address === fromToken.address)?.decimals ||
    18;
  const toTokenDecimals =
    tokenList.find((token) => token.address === toToken.address)?.decimals ||
    18;

  const { quotedAmountOut: uniswapPrice, isLoading: isUniswapPriceLoading } =
    useQuote(
      direction === "fromTo" ? fromToken : toToken,
      direction === "fromTo" ? toToken : fromToken,
      parseFloat(amount || "0"),
      direction === "fromTo" ? toTokenZeroCount : fromTokenZeroCount
    );

  const {
    quotedAmountOut: sushiSwapPrice,
    isLoading: isSushiSwapPriceLoading,
  } = useSushiSwapQuote(
    direction === "fromTo" ? fromToken : toToken,
    direction === "fromTo" ? toToken : fromToken,
    parseFloat(amount || "0"),
    direction === "fromTo" ? toTokenZeroCount : fromTokenZeroCount
  );

  const { data: usdcBalance } = useReadContract({
    address: USDC_TOKEN.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address],
  });

  const { data: wethBalance } = useReadContract({
    address: WETH_TOKEN.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address],
  });

  useEffect(() => {
    const updateViews = async () => {
      const bestPrice = Math.max(uniswapPrice, sushiSwapPrice);
      if (bestPrice == 0) {
        return;
      }
      let bestDexName = "";
      if (bestPrice === uniswapPrice) {
        bestDexName = "Uniswap";
      } else {
        bestDexName = "SushiSwap";
      }

      setBestDex(bestDexName);
      if (direction == "fromTo") {
        setToAmount(formatNumber(bestPrice, toTokenDecimals));
      } else {
        setFromAmount(formatNumber(bestPrice, fromTokenDecimals));
      }
    };
    updateViews();
  }, [
    amount,
    direction,
    fromTokenDecimals,
    reverse,
    sushiSwapPrice,
    toTokenDecimals,
    uniswapPrice,
  ]);

  useEffect(() => {
    setAmount(direction === "fromTo" ? fromAmount : toAmount);
  }, [fromAmount, toAmount]);

  const handleFromAmountChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setDirection("fromTo");
    const { value } = event.target;
    if (value == "" || value == "0") {
      setToAmount("");
    }
    const formated = (value as string).split(",").join("");
    setFromAmount(formated);
    setBestDex("");
  };

  const handleToAmountChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setDirection("toFrom");
    const { value } = event.target;
    if (value == "" || value == "0") {
      setFromAmount("");
    }
    const formated = (value as string).split(",").join("");
    setToAmount(formated);
    setBestDex("");
  };

  const handleFromTokenChange = (value: string) => {
    const from = fromToken;
    const to = tokenList.find((token) => token.address === value);
    setToToken(BLANK_TOKEN);
    setFromToken(to as ExtendedToken);
    setToToken(from);
    setFromAmount("");
    setToAmount("");
    setReverse(!reverse);
    setBestDex("");
  };

  const handleToTokenChange = (value: string) => {
    const to = toToken;
    const from = tokenList.find((token) => token.address === value);
    setToToken(BLANK_TOKEN);
    setToToken(from as ExtendedToken);
    setFromToken(to);
    setFromAmount("");
    setToAmount("");
    setReverse(!reverse);
    setBestDex("");
  };

  const { calldata, swapRoute } = useCreateRoute(
    direction === "fromTo" ? fromToken : toToken,
    direction === "fromTo" ? toToken : fromToken,
    parseFloat(amount || "0")
  );
  const { getTrade } = useCreateTrade(
    direction === "fromTo" ? fromToken : toToken,
    direction === "fromTo" ? toToken : fromToken,
    calldata as string,
    swapRoute,
    parseFloat(amount || "0")
  );
  const { approve, error, isApproved } = useApprove();
  const {
    deposit,
    withdraw,
    error: depositError,
    isSuccess: isDeposited,
  } = useWETH(parseFloat(localeStringToFloatString(amount as string) || "0"));

  const handleSwap = useCallback(async () => {
    setTrade(getTrade());
    // if(fromToken.address != WETH_TOKEN.address){
      await deposit()
    // }

    await approve({
      address: (direction === "fromTo" ? fromToken : toToken)
        .address as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [
        SWAP_ROUTER_ADDRESS,
        fromReadableAmount(
          parseFloat(amount || "0"),
          (direction === "fromTo" ? fromToken : toToken).decimals
        ).toString(),
      ],
    });
  }, [amount, approve, deposit, getTrade]);

  const { executeTrade } = useExecuteTrade(trade, address);

  useEffect(() => {
    if (isApproved) {
      executeTrade();
    }
  }, [isApproved]);

  const swapButtonClass = () => {
    if (!bestDex) {
      return "bg-yellow-600";
    }
    return bestDex == "Uniswap" ? "bg-pink-500" : "bg-purple-600";
  };

  const [slippage, setSlippage] = useState("2.5")

  const handleSlippageChange = (value: SetStateAction<string>) => {
    setSlippage(value)
  }

  const settings = (
    <>
      <p>Slippage Tolerance</p>
      <div>
        <ToggleGroup onValueChange={handleSlippageChange} type="single" value={slippage}>
          <ToggleGroupItem  value="0.5" aria-label="0.5%">
            0.5%
          </ToggleGroupItem>
          <ToggleGroupItem value="2.5" aria-label="2.5%">
            2.5%
          </ToggleGroupItem>
          <ToggleGroupItem value="5" aria-label="5%">
            5%
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </>
  );

  const [tokenOneAmount, setTokenOneAmount] = useState<string | undefined>(undefined)
  const [tokenTwoAmount, setTokenTwoAmount] = useState<string | undefined>(undefined)

  const changeAmount = (e: { target: { value: SetStateAction<string | undefined>; }; }) => {
    setTokenOneAmount(e.target.value)
  }

  return (
    <main className="flex-grow flex items-center justify-center p-4">
      {/* <div className="w-full md:w-[600px] bg-slate-900 text-white rounded p-4">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-xl font-bold">Swap</h3>
          <Popover>
            <PopoverTrigger>
              <Settings />
            </PopoverTrigger>
            <PopoverContent className="bg-slate-900 text-white" side="left">{settings}</PopoverContent>
          </Popover>
        </div>
        <div>
          <Input className="rounded-2xl text-4xl px-4 py-12 bg-slate-400 text-white" value={tokenOneAmount} placeholder="0" onChange={changeAmount} />
          <Input className="rounded-2xl text-4xl px-4 py-12 bg-slate-400 text-white" value={tokenTwoAmount} placeholder="0" disabled={true} />
          <div></div>
          <div></div>
        </div>
      </div> */}
      {isConnected ? (
        <div className="bg-gray-200 p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6">Swap Tokens</h2>
          <Label htmlFor="fromToken">From</Label>
          <div id="fromToken" className="mb-4 flex">
            <Input type="text" placeholder="0" value={fromAmount} onChange={handleFromAmountChange} />
            <Select onValueChange={handleFromTokenChange} value={fromToken.address}>
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
            <Select onValueChange={handleToTokenChange} value={toToken.address}>
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
          <div className="my-4">
            {isSushiSwapPriceLoading ? 'Sushiswap Loading': ''}
            {isUniswapPriceLoading ? 'Uniswap Loading': ''}
            <p>{`Best price found on: ${isUniswapPriceLoading || isSushiSwapPriceLoading ? 'Loading...': bestDex}`}</p>
          </div>
          <p>Uniswap Price: {uniswapPrice}</p>
          <p>Sushiswap Price: {sushiSwapPrice}</p>
          <p>ETH: {adjustNumber(Number(ethBalance?.value || 0), 18)}</p>
          <p>WETH: {adjustNumber(Number(wethBalance || 0), 18)}</p>
          <p>USDC: {adjustNumber(Number(usdcBalance || 0), 6)}</p>
          <Button
            // disabled={quotedAmountOut === '0'}
            onClick={handleSwap}
            className={`w-full ${swapButtonClass()} hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            Swap on {bestDex}
          </Button>
        </div>
      ) : (
        <ConnectButton />
      )}
    </main>
  );
};
