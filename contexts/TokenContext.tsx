import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  SetStateAction,
} from "react";
import tokensList from "@/lib/tokenList.json";
import { useAccount } from "wagmi";
import { localeStringToFloatString, adjustNumber } from "@/lib/format";
import { Token } from "@/components/swap/SwapBox";
import { useQuote } from "@/hooks/useQuote";

type TokensByChainId = {
  [key: string]: Token[];
};

const tokens: TokensByChainId = tokensList;

interface TokenContextType {
  tokenOne: Token;
  setTokenOne: React.Dispatch<React.SetStateAction<Token>>;
  tokenTwo: Token;
  setTokenTwo: React.Dispatch<React.SetStateAction<Token>>;
  tokenOneAmount?: string;
  setTokenOneAmount: React.Dispatch<React.SetStateAction<string | undefined>>;
  tokenTwoAmount?: string;
  setTokenTwoAmount: React.Dispatch<React.SetStateAction<string | undefined>>;
  prices: any;
  setPrices: React.Dispatch<React.SetStateAction<any>>;
  changeAmount: (e: {
    target: { value: React.SetStateAction<string | undefined> };
  }) => void;
  switchTokens: () => void;
  openModal: (asset: number) => void;
  modifyToken: (index: number) => void;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  changeToken: number;
  setChangeToken: React.Dispatch<React.SetStateAction<number>>;
}

export interface Prices {
  uniSwapPrice: number;
  sushiSwapPrice: number;
  bestPrice: number;
  isSushiQuoteLoading: boolean;
  isUniswapQuoteLoading: boolean;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export const TokenProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { chainId } = useAccount();

  const [tokenOneAmount, setTokenOneAmount] = useState<string | undefined>(
    undefined
  );
  const [tokenTwoAmount, setTokenTwoAmount] = useState<string | undefined>(
    undefined
  );
  const [tokenOne, setTokenOne] = useState(tokens[`${chainId || "1"}`][0]);
  const [tokenTwo, setTokenTwo] = useState(tokens[`${chainId || "1"}`][1]);
  const [prices, setPrices] = useState<Prices | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [changeToken, setChangeToken] = useState(1);

  const quote = useQuote(
    tokenOne,
    tokenTwo,
    localeStringToFloatString(tokenOneAmount as string) as string,
    tokenOne.decimals
  );

  useEffect(() => {
    if (tokenOneAmount === "" || tokenOneAmount === "0") {
      setTokenTwoAmount("");
      return;
    }
    setTokenTwoAmount(
      adjustNumber(tokenOne, tokenTwo, quote?.bestPrice as number, tokenTwo.decimals)
    );
    setPrices(quote as Prices);
  }, [tokenOneAmount, quote.bestPrice, tokenOne, tokenTwo]);

  const changeAmount = (e: {
    target: { value: SetStateAction<string | undefined> };
  }) => {
    const regex = /^\d*(\.\d*)?$/;
    if(regex.test(e.target.value as string)){
      setTokenOneAmount(e.target.value);
    }
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
  return (
    <TokenContext.Provider
      value={{
        tokenOne,
        setTokenOne,
        tokenTwo,
        setTokenTwo,
        tokenOneAmount,
        setTokenOneAmount,
        tokenTwoAmount,
        setTokenTwoAmount,
        prices,
        setPrices,
        changeAmount,
        switchTokens,
        openModal,
        modifyToken,
        isOpen,
        setIsOpen,
        changeToken,
        setChangeToken,
      }}
    >
      {children}
    </TokenContext.Provider>
  );
};

export const useTokenContext = () => {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error("useTokenContext must be used within a TokenProvider");
  }
  return context;
};
