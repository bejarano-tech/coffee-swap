import { createContext, useContext, useState } from "react";

interface SlippageContextType {
  slippage: string;
  setSlippage: React.Dispatch<React.SetStateAction<string>>;
  handleSlippageChange: (value: React.SetStateAction<string>) => void;
}

const SlippageContext = createContext<SlippageContextType | undefined>(undefined);

export const SlippageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [slippage, setSlippage] = useState("2.5");

  const handleSlippageChange = (value: React.SetStateAction<string>) => {
    setSlippage(value);
  };

  return (
    <SlippageContext.Provider
      value={{
        slippage,
        setSlippage,
        handleSlippageChange,
      }}
    >
      {children}
    </SlippageContext.Provider>
  );
};

export const useSlippageContext = () => {
  const context = useContext(SlippageContext);
  if (context === undefined) {
    throw new Error("useSlippageContext must be used within a SlippageProvider");
  }
  return context;
};
