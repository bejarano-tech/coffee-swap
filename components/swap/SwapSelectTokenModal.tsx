import Image from 'next/image'
import { Modal } from "../Modal";
import { Token } from "./SwapBox";

interface SwapSelectTokenModalProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  tokens: Token[]
  modifyToken: (index: number) => void 
}

export const SwapSelectTokenModal = ({isOpen, setIsOpen, tokens, modifyToken}: SwapSelectTokenModalProps) => {
  return (
    <Modal
      title="Select a Token"
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
    >
      <div>
        {tokens.map((token, index) => {
          return (
            <div
              className="flex items-center hover:bg-slate-200 p-4 hover:cursor-pointer"
              key={index}
              onClick={() => modifyToken(index)}
            >
              <div>
                <Image
                  src={token.img}
                  alt={token.symbol}
                  objectFit="contain"
                  height={40}
                  width={40}
                />
              </div>
              <div className="ms-4 my-2">
                <div>{token.name}</div>
                <div>{token.symbol}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
};
