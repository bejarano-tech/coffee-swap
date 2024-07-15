"use client"
import { Settings } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { SetStateAction, useState } from "react";

export const SwapSettings = () => {
  const [slippage, setSlippage] = useState("2.5");

  const handleSlippageChange = (value: SetStateAction<string>) => {
    console.log(value)
    setSlippage(value);
  };

  return (
    <Popover>
      <PopoverTrigger>
        <Settings />
      </PopoverTrigger>
      <PopoverContent className="bg-slate-900 text-white" side="left">
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
      </PopoverContent>
    </Popover>
  );
};
