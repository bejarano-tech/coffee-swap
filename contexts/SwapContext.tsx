import React, { createContext, useContext, useState, useEffect, useTransition } from "react";
import { useAccount } from "wagmi";
import { useApprove } from "@/hooks/useApprove";
import { useBalances } from "@/hooks/useBalances";
import { useWETH } from "@/hooks/useWETH";
import { ETH_TOKEN, SUSHISWAP_ROUTER_ADDRESS, UNISWAP_SWAP_ROUTER_ADDRESS, WETH_TOKEN } from "@/lib/constants";
import { getAllowance } from "@/app/actions";
import { localeStringToFloatString } from "@/lib/format";
import { fromReadableAmount, toReadableAmount } from "@/lib/conversion";
import { useSwap } from "@/hooks/useSwap";
import { ERC20_ABI } from "@/blockchain/abis/ERC_20";
import { useTokenContext } from "./TokenContext";

interface Error {
  title: string;
  description: string;
}

interface SwapContextType {
  error: Error | null;
  setError: React.Dispatch<React.SetStateAction<Error | null>>;
  handleApprove: (allowance: number) => Promise<void>;
  swap: () => void;
  handleSwap: () => void;
  hasBalance: () => boolean;
  isPending: boolean;
  isApproving: boolean;
  isApproved: boolean;
}

const SwapContext = createContext<SwapContextType | undefined>(undefined);

export const SwapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, chainId } = useAccount();
  const { approve, isApproving, isApproved } = useApprove();
  const { tokenOne, tokenTwo, tokenOneAmount, tokenTwoAmount, prices } = useTokenContext();

  const amountTwoWithdraw =
    tokenOne.symbol != ETH_TOKEN.symbol &&
    tokenOne.symbol != WETH_TOKEN.symbol &&
    tokenTwo.symbol == ETH_TOKEN.symbol
      ? tokenTwoAmount
      : tokenOneAmount;
  const decimalsTwoWithdraw =
    tokenOne.symbol != ETH_TOKEN.symbol &&
    tokenOne.symbol != WETH_TOKEN.symbol &&
    tokenTwo.symbol == ETH_TOKEN.symbol
      ? tokenTwo.decimals
      : tokenOne.decimals;
  const {
      deposit,
      withdraw,
      error: depositError,
      isSuccess: isDeposited,
    } = useWETH(
      parseFloat(localeStringToFloatString(amountTwoWithdraw as string) || "0"),
      decimalsTwoWithdraw
    );
    const { tokenOneBalance } = useBalances(tokenOne, tokenTwo);
    const [error, setError] = useState<Error | null>(null);
    const [isPending, startTransition] = useTransition();
    const { uniswapSwap, sushiswapSwap } = useSwap(
      tokenOne,
      tokenTwo,
      tokenOneAmount as string
    );  
    const hasBalance = () => {
      return (
        parseFloat(
          toReadableAmount(tokenOneBalance as number, tokenOne.decimals)
        ) <
        parseFloat(localeStringToFloatString(tokenOneAmount as string) as string)
      );
    };
    const handleApprove = async (allowance: number) => {
      if (allowance === 0) {
        console.log("Approve WETH");
        try {
          await approve({
            address: (tokenOne.symbol == ETH_TOKEN.symbol ? WETH_TOKEN : tokenOne)
              .address as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [
              prices.bestDex == "uniswap"
                ? UNISWAP_SWAP_ROUTER_ADDRESS
                : SUSHISWAP_ROUTER_ADDRESS,
              fromReadableAmount(
                parseFloat(
                  localeStringToFloatString(tokenOneAmount as string) || "0"
                ),
                tokenOne.decimals
              ).toString(),
            ],
          });
        } catch (error) {
          console.log(error);
        }
      }
    };
    const swap = async () => {
      if (prices.bestDex == "uniswap") {
        await uniswapSwap();
      } else {
        await sushiswapSwap();
      }
    };
    const handleSwap = () => {
      startTransition(async () => {
        const allowance = await getAllowance(
          chainId as number,
          (tokenOne.symbol == ETH_TOKEN.symbol ? WETH_TOKEN : tokenOne).address,
          address as string,
          prices.bestDex
        );
        if (tokenOne.symbol === "ETH" && tokenTwo.symbol === "ETH") {
          console.log("Nothing to do");
          return;
        } else if (tokenOne.symbol === "ETH" && tokenTwo.symbol === "WETH") {
          await deposit();
        } else if (tokenOne.symbol === "ETH") {
          if (tokenTwo.symbol !== "WETH") {
            await deposit();
            await handleApprove(allowance as number);
            await swap();
          }
        } else if (tokenOne.symbol === "WETH" && tokenTwo.symbol === "WETH") {
          console.log("Nothing to do");
          return;
        } else if (tokenOne.symbol === "WETH" && tokenTwo.symbol === "ETH") {
          await handleApprove(allowance as number);
          await handleWithdraw();
        } else if (tokenOne.symbol === "WETH") {
          if (tokenTwo.symbol !== "ETH") {
            await handleApprove(allowance as number);
            await swap();
          }
        } else if (tokenTwo.symbol === "ETH") {
          await handleApprove(allowance as number);
          await swap();
          await handleWithdraw();
        } else if (tokenTwo.symbol === "WETH") {
          await handleApprove(allowance as number);
          await swap();
        } else {
          await handleApprove(allowance as number);
          await swap();
        }
      });
    };
    const handleWithdraw = async () => {
      console.log("Withdraw");
      await withdraw();
      try {
      } catch (error) {
        console.log(error);
      }
    };
    useEffect(() => {
      if (hasBalance()) {
        setError({
          title: `You don't have enough ${tokenOne.symbol} balance`,
          description: `You need to have at least X ${tokenOne.symbol} to carry out this swap`,
        });
      } else {
        setError(null);
      }
    }, [tokenOneBalance, tokenOneAmount]);
  return (
    <SwapContext.Provider
      value={{
        error,
        setError,
        handleApprove,
        swap,
        handleSwap,
        hasBalance,
        isPending,
        isApproving,
        isApproved
      }}
    >
      {children}
    </SwapContext.Provider>
  );
};

export const useSwapContext = () => {
  const context = useContext(SwapContext);
  if (context === undefined) {
    throw new Error("useSwapContext must be used within a SwapProvider");
  }
  return context;
};
