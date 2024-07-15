"use client";
import { SetStateAction, useEffect, useState, useTransition } from "react";
import { getAllowance, getPrices } from "@/app/actions";
import {
  adjustNumber,
  localeStringToFloatString,
} from "@/lib/format";
import { useAccount } from "wagmi";
import tokensList from "@/lib/tokenList.json";
import { useApprove } from "@/hooks/useApprove";
import { ERC20_ABI } from "@/blockchain/abis/ERC_20";
import {
  ETH_TOKEN,
  SUSHISWAP_ROUTER_ADDRESS,
  UNISWAP_SWAP_ROUTER_ADDRESS,
  WETH_TOKEN,
} from "@/lib/constants";
import { fromReadableAmount, toReadableAmount } from "@/lib/conversion";
import { useBalances } from "@/hooks/useBalances";
import { useWETH } from "@/hooks/useWETH";
import { useSwap } from "@/hooks/useSwap";
import { SwapHeader } from "./SwapHeader";
import { SwapTokenInput } from "./SwapTokenInput";
import { SwapSwitchTokensButton } from "./SwapSwitchTokensButton";
import { SwapErrorMessage } from "./SwapErrorMessage";
import { SwapButton } from "./SwapButton";
import { SwapSelectTokenModal } from "./SwapSelectTokenModal";

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
  title: string;
  description: string;
}

export const SwapBox = () => {
  const { isConnected, address, chainId } = useAccount();
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
  const { tokenOneBalance, tokenTwoBalance } = useBalances(tokenOne, tokenTwo);
  const [error, setError] = useState<Error | null>(null);
  const [bestDex, setBestDex] = useState("");
  const { uniswapSwap, sushiswapSwap } = useSwap(
    tokenOne,
    tokenTwo,
    tokenOneAmount as string
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
      setBestDex(prices.bestDex as string);
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
    if (
      tokens[`${chainId || "1"}`][index].symbol === tokenTwo.symbol ||
      tokens[`${chainId || "1"}`][index].symbol === tokenOne.symbol
    ) {
      setIsOpen(false);
    }
    if (changeToken === 1) {
      if (tokens[`${chainId || "1"}`][index].symbol === tokenTwo.symbol) {
        setTokenTwo(tokenOne);
        setTokenOne(tokens[`${chainId || "1"}`][index]);
      } else {
        setTokenOne(tokens[`${chainId || "1"}`][index]);
      }
    } else {
      if (tokens[`${chainId || "1"}`][index].symbol === tokenOne.symbol) {
        setTokenOne(tokenTwo);
        setTokenTwo(tokens[`${chainId || "1"}`][index]);
      } else {
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
          address: (tokenOne.symbol == ETH_TOKEN.symbol ? WETH_TOKEN : tokenOne)
            .address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [
            bestDex == "uniswap"
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
    if (bestDex == "uniswap") {
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
        bestDex
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

  const hasBalance = () => {
    return (
      parseFloat(
        toReadableAmount(tokenOneBalance as number, tokenOne.decimals)
      ) <
      parseFloat(localeStringToFloatString(tokenOneAmount as string) as string)
    );
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
    <main className="flex-grow flex items-center justify-center p-4">
      <SwapSelectTokenModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        tokens={tokens[`${chainId || "1"}`]}
        modifyToken={modifyToken}
      />
      <div className="w-full md:w-[600px] bg-slate-900 text-white rounded-3xl p-8">
        <SwapHeader />
        <div>
          <SwapTokenInput
            amount={tokenOneAmount}
            onChange={changeAmount}
            openModal={openModal}
            balance={tokenOneBalance as number}
            token={tokenOne}
            index={1}
          />
          <SwapSwitchTokensButton switchTokens={switchTokens} />
          <div className="mb-8">
            <SwapTokenInput
              amount={tokenTwoAmount}
              onChange={changeAmount}
              openModal={openModal}
              balance={tokenTwoBalance as number}
              token={tokenTwo}
              index={2}
            />
          </div>
          <p>
            {bestDex ? (bestDex == "uniswap" ? "Uniswap" : "Sushiswap") : null}
          </p>
          {error ? <SwapErrorMessage {...error} /> : null}
          <SwapButton
            handleSwap={handleSwap}
            disabled={
              isPending ||
              !tokenOneAmount ||
              !isConnected ||
              isApproving ||
              hasBalance()
            }
            loading={isPending || (isApproving && !isApproved)}
          />
        </div>
      </div>
    </main>
  );
};
