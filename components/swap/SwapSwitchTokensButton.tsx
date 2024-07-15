import { ArrowDown } from "lucide-react";

interface SwapSwitchTokensButtonProps {
  switchTokens: () => void
}

export const SwapSwitchTokensButton = ({switchTokens}: SwapSwitchTokensButtonProps) => {
  return (
    <div className="flex justify-center my-4">
      <div
        data-testid="token-button"
        onClick={switchTokens}
        className="rounded-full bg-slate-500 p-1 hover:cursor-pointer"
      >
        <ArrowDown />
      </div>
    </div>
  );
};
