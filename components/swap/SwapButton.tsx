import { Button } from "../ui/button";

interface SwapButtonProps {
  handleSwap: () => void
  disabled: boolean
  loading: boolean
}

export const SwapButton = ({handleSwap, disabled, loading}: SwapButtonProps) => {
  return (
    <Button
      onClick={handleSwap}
      // disabled={
        // isPending ||
        // !tokenOneAmount ||
        // !isConnected ||
        // isApproving ||
        // hasBalance()
      // }
      disabled={disabled}
      variant="big"
      className="px-4 py-12 rounded-3xl"
    >
      {loading ? "Loading..." : "Swap"}
      {/* {isPending || (isApproving && !isApproved) ? "Loading..." : "Swap"} */}
    </Button>
  );
};
