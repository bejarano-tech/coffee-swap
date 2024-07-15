"use client";
import { SetStateAction, useEffect, useState, useTransition } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Settings, ArrowDown } from "lucide-react";
import Image from "next/image";
import { Input } from "./ui/input";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { Button } from "./ui/button";
import tokenList from "@/lib/tokenList.json";
import { Modal } from "./Modal";
import { getAllowance, getApprove, getPrices } from "@/app/actions";
import { adjustNumber, formatNumber, localeStringToFloatString } from "@/lib/format";
import { useAccount, useSendTransaction } from "wagmi";
import { parseUnits } from "ethers";
import tokensList from "@/lib/tokenList.json";
import { useApprove } from "@/hooks/useApprove";
import { ERC20_ABI } from "@/blockchain/abis/ERC_20";
import { ETH_TOKEN, SUSHISWAP_ROUTER_ADDRESS, UNISWAP_SWAP_ROUTER_ADDRESS, WETH_TOKEN } from "@/lib/constants";
import { fromReadableAmount, toReadableAmount } from "@/lib/conversion";
import { useBalances } from "@/hooks/useBalances";
import { useWETH } from "@/hooks/useWETH";
import { useSwap } from "@/hooks/useSwap";

export type Token = {
  symbol: string;
  img: string;
  name: string;
  address: string;
  decimals: number;
};

type TokensByChainId = {
  [key: string]: Token[];
};

const tokens: TokensByChainId = tokensList;

interface Error {
  title: string
  description: string
}

export const Swap = () => {
  const { isConnected, address, chainId } = useAccount();
  const [slippage, setSlippage] = useState("2.5");
  const [tokenOneAmount, setTokenOneAmount] = useState<string | undefined>(
    undefined
  );
  const [tokenTwoAmount, setTokenTwoAmount] = useState<string | undefined>(
    undefined
  );

  const [tokenOne, setTokenOne] = useState(tokens[`${chainId || "1"}`][0]);
  const [tokenTwo, setTokenTwo] = useState(tokens[`${chainId || "1"}`][1]);
  const [isOpen, setIsOpen] = useState(false);
  const [changeToken, setChangeToken] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [prices, setPrices] = useState(null);
  const { approve, isApproving, isApproved } = useApprove();
  const amountTwoWithdraw = (tokenOne.symbol != ETH_TOKEN.symbol && tokenOne.symbol != WETH_TOKEN.symbol && tokenTwo.symbol == ETH_TOKEN.symbol) ? tokenTwoAmount : tokenOneAmount
  const decimalsTwoWithdraw = (tokenOne.symbol != ETH_TOKEN.symbol && tokenOne.symbol != WETH_TOKEN.symbol && tokenTwo.symbol == ETH_TOKEN.symbol) ? tokenTwo.decimals : tokenOne.decimals
  const {
    deposit,
    withdraw,
    error: depositError,
    isSuccess: isDeposited,
  } = useWETH(parseFloat(localeStringToFloatString(amountTwoWithdraw as string) || "0"), decimalsTwoWithdraw);
  const { tokenOneBalance, tokenTwoBalance } = useBalances(
    tokenOne,
    tokenTwo
  );
  const [error, setError] = useState<Error| null>(null)
  const [bestDex, setBestDex] = useState(""); 
  const { uniswapSwap, sushiswapSwap } = useSwap(tokenOne, tokenTwo, tokenOneAmount as string)
  const handleSlippageChange = (value: SetStateAction<string>) => {
    setSlippage(value);
  };

  const settings = (
    <>
      <p>Slippage Tolerance</p>
      <div>
        <ToggleGroup
          onValueChange={handleSlippageChange}
          type="single"
          value={slippage}
        >
          <ToggleGroupItem value="0.5" aria-label="0.5%">
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

  const changeAmount = (e: {
    target: { value: SetStateAction<string | undefined> };
  }) => {
    setTokenOneAmount(e.target.value);
    startTransition(async () => {
      if (e.target.value == "" || e.target.value == "0") {
        return;
      }
      const prices = await getPrices(
        tokenOne,
        tokenTwo,
        localeStringToFloatString(e.target.value as string) as string,
        tokenOne.decimals
      );
      setBestDex(prices.bestDex as string)
      setTokenTwoAmount(
        adjustNumber(prices.bestPrice, tokenTwo.decimals).toLocaleString(
          "en-US"
        )
      );
    });
  };

  const switchTokens = () => {
    setPrices(null);
    setTokenOneAmount("");
    setTokenTwoAmount("");
    const one = tokenOne;
    const two = tokenTwo;
    setTokenOne(two);
    setTokenTwo(one);
  };

  const openModal = (asset: number) => {
    setChangeToken(asset);
    setIsOpen(true);
  };

  const modifyToken = (index: number) => {
    setPrices(null);
    setTokenOneAmount("");
    setTokenTwoAmount("");
    if(tokens[`${chainId || "1"}`][index].symbol === tokenTwo.symbol || tokens[`${chainId || "1"}`][index].symbol === tokenOne.symbol ){
      setIsOpen(false)
    }
    if (changeToken === 1) {
      if(tokens[`${chainId || "1"}`][index].symbol === tokenTwo.symbol){
        setTokenTwo(tokenOne);
        setTokenOne(tokens[`${chainId || "1"}`][index]);
      }else{
        setTokenOne(tokens[`${chainId || "1"}`][index]);
      }
    } else {
      if(tokens[`${chainId || "1"}`][index].symbol === tokenOne.symbol){
        setTokenOne(tokenTwo);
        setTokenTwo(tokens[`${chainId || "1"}`][index]);
      } else{
        setTokenTwo(tokens[`${chainId || "1"}`][index]);
      }
    }
    setIsOpen(false);
  };

  const handleApprove = async (allowance: number) => {
    if (allowance === 0) {
      console.log("Approve WETH");
      try {
        await approve({
          address: (tokenOne.symbol == ETH_TOKEN.symbol ? WETH_TOKEN : tokenOne).address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [
            bestDex == 'uniswap' ? UNISWAP_SWAP_ROUTER_ADDRESS : SUSHISWAP_ROUTER_ADDRESS,
            fromReadableAmount(
              parseFloat(localeStringToFloatString(tokenOneAmount as string) || "0"),
              tokenOne.decimals
            ).toString(),
          ],
        });
      } catch (error) {
        console.log(error);
      }
    }
  }

  const handleSwap = async () => {
    if (bestDex == 'uniswap') {
      await uniswapSwap()
    }else {
      await sushiswapSwap()
    }
  }

  const handleSwapFlow = () => {
    startTransition(async () => {
      const allowance = await getAllowance(
        chainId as number,
        (tokenOne.symbol == ETH_TOKEN.symbol ? WETH_TOKEN : tokenOne).address,
        address as string,
        bestDex
      );
      if (tokenOne.symbol === "ETH" && tokenTwo.symbol === "ETH") {
        console.log("Nothing to do");
        return;
      } else if (tokenOne.symbol === "ETH" && tokenTwo.symbol === "WETH") {
        await deposit()
      } else if (tokenOne.symbol === "ETH") {
        if (tokenTwo.symbol !== "WETH") {
          await deposit()
          await handleApprove(allowance as number);
          await handleSwap()
        }
      } else if (tokenOne.symbol === "WETH" && tokenTwo.symbol === "WETH") {
        console.log("Nothing to do");
        return;
      } else if (tokenOne.symbol === "WETH" && tokenTwo.symbol === "ETH") {
        await handleApprove(allowance as number);
        await handleWithdraw()
      } else if (tokenOne.symbol === "WETH") {
        if (tokenTwo.symbol !== "ETH") {
          await handleApprove(allowance as number);
          await handleSwap()
        }
      } else if (tokenTwo.symbol === "ETH") {
        await handleApprove(allowance as number);
        await handleSwap()
        await handleWithdraw()
      } else if (tokenTwo.symbol === "WETH") {
        await handleApprove(allowance as number);
        await handleSwap()
      } else {
        await handleApprove(allowance as number);
        await handleSwap()
      }
    });
  };

  const handleWithdraw = async () => {
    console.log("Withdraw")
    await withdraw()
    try {
    } catch (error) {
      console.log(error);
    }
  }

  const hasBalance = () => {
    return parseFloat(toReadableAmount(tokenOneBalance as number, tokenOne.decimals)) < parseFloat(localeStringToFloatString(tokenOneAmount as string) as string)
  }

  useEffect(() => {
    if(hasBalance()) {
      setError({
        title: `You don't have enough ${tokenOne.symbol} balance`,
        description: `You need to have at least X ${tokenOne.symbol} to carry out this swap`
      })
    } else {
      setError(null)
    }
  }, [tokenOneBalance, tokenOneAmount])

  return (
    <main className="flex-grow flex items-center justify-center p-4">
      <Modal
        title="Select a Token"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <div>
          {tokens[`${chainId || "1"}`].map((token, index) => {
            return (
              <div
                className="flex items-center hover:bg-slate-200 p-4 hover:cursor-pointer"
                key={index}
                onClick={() => modifyToken(index)}
              >
                <div>
                  <Image
                    src={token.img}
                    alt={token.symbol}
                    objectFit="contain"
                    height={40}
                    width={40}
                  />
                </div>
                <div className="ms-4 my-2">
                  <div>{token.name}</div>
                  <div>{token.symbol}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
      <div className="w-full md:w-[600px] bg-slate-900 text-white rounded-3xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold">Swap</h3>
          <Popover>
            <PopoverTrigger>
              <Settings />
            </PopoverTrigger>
            <PopoverContent className="bg-slate-900 text-white" side="left">
              {settings}
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <div className="relative">
            <Input
              className="rounded-2xl text-4xl px-4 py-12 bg-slate-400 text-white w-full"
              value={tokenOneAmount}
              placeholder="0"
              onChange={changeAmount}
            />
            <div
              id="tokenOne"
              onClick={() => openModal(1)}
              className=" bg-slate-500 hover:cursor-pointer rounded-full p-2 absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2"
            >
              <Image
                width={40}
                height={40}
                src={tokenOne.img}
                alt="AssetOne Logo"
              />
              <span className="font-bold">{tokenOne.symbol}</span>
              <ArrowDown />
            </div>
            <div className="mt-1 me-1 absolute right-0 flex justify-end">
              <span className="text-right text-slate-400">
                {tokenOne.symbol} Balance:{" "}
                {parseFloat(toReadableAmount(tokenOneBalance as number, tokenOne.decimals))}
              </span>
            </div>
          </div>
          <div className="flex justify-center my-4">
            <div
              onClick={switchTokens}
              className="rounded-full bg-slate-500 p-1 hover:cursor-pointer"
            >
              <ArrowDown />
            </div>
          </div>
          <div className="relative mb-8">
            <Input
              className="rounded-2xl text-4xl px-4 py-12 bg-slate-400 text-white w-full"
              value={tokenTwoAmount}
              placeholder="0"
              disabled={true}
            />
            <div
              id="tokenTwo"
              onClick={() => openModal(2)}
              className="bg-slate-500 hover:cursor-pointer rounded-full p-2 absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2"
            >
              <Image
                width={40}
                height={40}
                src={tokenTwo.img}
                alt="AssetTwo Logo"
              />
              <span className="font-bold">{tokenTwo.symbol}</span>
              <ArrowDown />
            </div>
            <div className="mt-1 me-1 absolute right-0 flex justify-end">
              <span className="text-right text-slate-400">
                {tokenTwo.symbol} Balance:{" "}
                {parseFloat(toReadableAmount(tokenTwoBalance as number, tokenTwo.decimals))}
              </span>
            </div>
          </div>
          <p>{bestDex ? bestDex == 'uniswap' ? 'Uniswap' : 'Sushiswap' : null }</p>
          {error ? <div className="my-4 bg-red-400 p-4 rounded"><p>{error.title}</p><p>{error.description}</p></div> : null}
          <div>
            <Button
              onClick={handleSwapFlow}
              disabled={
                isPending || !tokenOneAmount || !isConnected || isApproving || hasBalance() 
              }
              variant="big"
              className="px-4 py-12 rounded-3xl"
            >
              {isPending || (isApproving && !isApproved)
                ? "Loading..."
                : "Swap"}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
};
