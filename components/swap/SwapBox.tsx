"use client";
import { useAccount } from "wagmi";
import tokensList from "@/lib/tokenList.json";
import { useBalances } from "@/hooks/useBalances";
import { SwapHeader } from "./SwapHeader";
import { SwapTokenInput } from "./SwapTokenInput";
import { SwapSwitchTokensButton } from "./SwapSwitchTokensButton";
import { SwapErrorMessage } from "./SwapErrorMessage";
import { SwapButton } from "./SwapButton";
import { SwapSelectTokenModal } from "./SwapSelectTokenModal";
import { useTokenContext } from "@/contexts/TokenContext";
import { useSwapContext } from "@/contexts/SwapContext";

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
  const { chainId, isConnected } = useAccount();
  const {
    isOpen,
    setIsOpen,
    modifyToken,
    tokenOneAmount,
    changeAmount,
    openModal,
    tokenOne,
    tokenTwo,
    tokenTwoAmount,
    switchTokens,
    prices,
  } = useTokenContext();
  const { tokenOneBalance, tokenTwoBalance } = useBalances(tokenOne, tokenTwo);
  const { error, handleSwap, isPending, isApproving, isApproved, hasBalance } =
    useSwapContext();

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
              disabled={true}
            />
          </div>
          <p>
            {tokenOneAmount == "" || parseFloat(tokenOneAmount as string) == 0
              ? null
              : prices?.bestDex
              ? prices?.bestDex == "uniswap"
                ? "Uniswap"
                : "Sushiswap"
              : null}
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
