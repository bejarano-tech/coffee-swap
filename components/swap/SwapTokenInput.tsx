import Image from "next/image";
import { Input } from "../ui/input";
import { ArrowDown } from "lucide-react";
import { toReadableAmount } from "@/lib/conversion";
import { SetStateAction } from "react";
import { Token } from "./SwapBox";

interface SwapTokenInputProps {
  amount: string | undefined;
  onChange: (e: {
    target: { value: SetStateAction<string | undefined> };
  }) => void;
  openModal: (asset: number) => void,
  balance: number,
  token: Token,
  index: number,
  disabled?: boolean
}

export const SwapTokenInput = ({
  amount,
  onChange,
  openModal,
  balance,
  token,
  index,
  disabled
}: SwapTokenInputProps) => {
  return (
    <div className="relative">
      <Input
        className="rounded-2xl text-4xl px-4 py-12 bg-slate-400 text-white w-full"
        value={amount}
        placeholder="0"
        onChange={onChange}
        disabled={disabled}
      />
      <div
        id="tokenOne"
        onClick={() => openModal(index)}
        className=" bg-slate-500 hover:cursor-pointer rounded-full p-2 absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2"
      >
        <Image width={40} height={40} src={token.img} alt="AssetOne Logo" />
        <span className="font-bold">{token.symbol}</span>
        <ArrowDown />
      </div>
      <div className="mt-1 me-1 absolute right-0 flex justify-end">
        <span className="text-right text-slate-400">
          {token.symbol} Balance:{" "}
          {parseFloat(toReadableAmount(balance as number, token.decimals))}
        </span>
      </div>
    </div>
  );
};
