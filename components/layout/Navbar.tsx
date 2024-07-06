import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">DEX Aggregator</h1>
        <ConnectButton />
      </div>
    </nav>
  );
}
