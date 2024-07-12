"use client";
import { SetStateAction, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Settings, ArrowDown } from "lucide-react";
import Image from "next/image";
import { Input } from "./ui/input";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import tokenList from "@/lib/tokenList.json";
import { Modal } from "./Modal";

export const Swap = () => {
  const [slippage, setSlippage] = useState("2.5");
  const [tokenOneAmount, setTokenOneAmount] = useState<string | undefined>(
    undefined
  );
  const [tokenTwoAmount, setTokenTwoAmount] = useState<string | undefined>(
    undefined
  );
  const [tokenOne, setTokenOne] = useState(tokenList[0]);
  const [tokenTwo, setTokenTwo] = useState(tokenList[1]);
  const [isOpen, setIsOpen] = useState(false);
  const [changeToken, setChangeToken] = useState(1);

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
  };

  const switchTokens = () => {
    const one = tokenOne;
    const two = tokenTwo;
    setTokenOne(two)
    setTokenTwo(one)
  }

  const openModal = (asset: number) => {
    setChangeToken(asset)
    setIsOpen(true)
  }

  return (
    <main className="flex-grow flex items-center justify-center p-4">
      <Modal title="Select a Token" isOpen={isOpen} onClose={() => setIsOpen(false)} >
        <div>
          {tokenList?.map((token, index) => {
            return (
              <div className="flex items-center hover:bg-slate-200 p-4 hover:cursor-pointer" key={index} onClick={() => modifyToken(index)}>
                <div><Image src={token.img} alt={token.symbol} objectFit="contain" height={40} width={40}/></div>
                <div className="ms-4 my-2">
                  <div>{token.name}</div>
                  <div>{token.symbol}</div>
                </div>
              </div>
            )
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
              className="bg-slate-500 hover:cursor-pointer rounded-full p-2 absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2"
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
          </div>
          <div className="flex justify-center my-4">
            <div onClick={switchTokens} className="rounded-full bg-slate-500 p-1 hover:cursor-pointer">
              <ArrowDown />
            </div>
          </div>
          <div className="relative">
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
          </div>
        </div>
      </div>
    </main>
  );
};
