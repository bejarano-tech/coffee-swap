import { SwapSettings } from "./SwapSettings";

export const SwapHeader = () => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h3 className="text-2xl font-bold">Swap</h3>
      <SwapSettings />
    </div>
  );
};
