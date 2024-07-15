import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  arbitrum,
  base,
  hardhat,
  localhost,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'wagmi/chains';

import { createStorage, cookieStorage } from 'wagmi'

export const config = getDefaultConfig({
  appName: 'RainbowKit demo',
  projectId: 'YOUR_PROJECT_ID',
  chains: [
    mainnet,
    // polygon,
    // optimism,
    // arbitrum,
    // base,
    ...(process.env.NEXT_PUBLIC_ENABLE_HARDHAT === 'true' ? [{ ...hardhat, id: 12 }] : []),
    // ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []), // Currently is not prepared for sepolia testnet
  ],
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
  syncConnectedChain: true
});
