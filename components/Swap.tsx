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
import { adjustNumber, formatNumber } from "@/lib/format";
import { useAccount, useSendTransaction } from "wagmi";
import { parseUnits } from "ethers";
import tokensList from "@/lib/tokenList.json";
import { useApprove } from "@/hooks/useApprove";
import { ERC20_ABI } from "@/blockchain/abis/ERC_20";
import { SWAP_ROUTER_ADDRESS } from "@/lib/constants";
import { fromReadableAmount } from "@/lib/conversion";
import { useBalances } from "@/hooks/useBalances";

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
  const { approve, error, isApproving, isApproved } = useApprove();
  const { ethBalance, tokenOneBalance, tokenTwoBalance } = useBalances(
    tokenOne.address,
    tokenTwo.address
  );

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
        e.target.value as string,
        tokenOne.decimals
      );
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

  const handleSwap = () => {
    startTransition(async () => {
      const allowance = await getAllowance(
        chainId as number,
        tokenOne.address,
        address as string
      );
      // if (allowance === 0) {
      //   try {
      //     await approve({
      //       address: tokenOne.address as `0x${string}`,
      //       abi: ERC20_ABI,
      //       functionName: "approve",
      //       args: [
      //         SWAP_ROUTER_ADDRESS,
      //         fromReadableAmount(
      //           parseFloat(tokenOneAmount || "0"),
      //           tokenOne.decimals
      //         ).toString(),
      //       ],
      //     });
      //   } catch (error) {
      //     console.log(error);
      //   }
      // }
      if (tokenOne.symbol === "ETH" && tokenTwo.symbol === "ETH") {
        console.log("Nothing to do");
      } else if (tokenOne.symbol === "ETH" && tokenTwo.symbol === "WETH") {
        console.log("Deposit");
      } else if (tokenOne.symbol === "ETH") {
        if (tokenTwo.symbol !== "WETH") {
          console.log("Deposit WETH");
          if (allowance === 0){
            console.log("Approve WETH");
          }
          console.log("Swap from WETH");
        }
      } else if (tokenOne.symbol === "WETH" && tokenTwo.symbol === "WETH") {
        console.log("Nothing to do");
      } else if (tokenOne.symbol === "WETH" && tokenTwo.symbol === "ETH") {
        if (allowance === 0){
          console.log("Approve tokenOne");
        }
          console.log("Withdraw");
      } else if (tokenOne.symbol === "WETH") {
        if (tokenTwo.symbol !== "ETH") {
          if (allowance === 0){
            console.log("Approve tokenOne");
          }
          console.log("Swap from WETH");
        }
      } else if (tokenTwo.symbol === "ETH") {
        if (allowance === 0){
          console.log("Aprove tokenOne");
        }
        console.log("Swap to WETH");
        console.log("Withdraw");
      } else if (tokenTwo.symbol === "WETH") {
        if (allowance === 0){
          console.log("Approve tokenOne");
        }
        console.log("Swap to WETH");
      } else {
        if (allowance === 0){
          console.log("Approve tokenOne");
        }
        console.log("Swap");
      }
    });
  };

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
                {adjustNumber(
                  Number(tokenOneBalance),
                  tokenOne.decimals
                ).toLocaleString("en-US")}
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
                {adjustNumber(
                  Number(tokenTwoBalance),
                  tokenTwo.decimals
                ).toLocaleString("en-US")}
              </span>
            </div>
          </div>
          <div>
            <Button
              onClick={handleSwap}
              disabled={
                isPending || !tokenOneAmount || !isConnected || isApproving
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
