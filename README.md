# CoffeeSwap

This project is a DEX Aggregator developed in React with Next.js 14, allowing trades on SushiSwap and UniSwap DEX according to the best available price.

## Features

- **DEX Integration**: Supports SushiSwap and UniSwap as DEX to fetch the best prices.
- **Best Price Trading**: Utilizes WAGMI and VIEM to compare and execute trades on the DEX with the best available price.
- **Responsive User Interface**: Developed using VIEM with optimized styles using Shadcdn and tailwind for an enhanced user experience.

## Requirements

- Node.js 14 or higher
- React.js
- Next.js 14
- Wagmi
- VIEM
- Shadcdn
- Tailwind

## Installation

1. Clone the repository:

  ```bash
    git clone https://github.com/bejarano-tech/coffee-swap.git
    cd coffee-swap
  ```

2. Install dependencies:

  ```bash
    npm install
  ```

3. Set up environment variables:

Copy a .env.example file in the root of the project and configure necessary environment variables. Save in a .env.local file

  ```bash
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=
    NEXT_PUBLIC_ENABLE_TESTNETS=true
    NEXT_PUBLIC_ENABLE_HARDHAT=true // only in development
  ```

## Usage
To start the project in development mode:

  ```bash
    npm run dev
  ```

## Using Foundry and Anvil

In order to develop safely you can use a blockchain fork.

There are several developer tools to fork Mainnet. Anvil by foundry is a newcomer that's fast and easy to setup. This guide focuses on Anvil.

As a first step, follow the installation guide in the foundry book.

Once you have done that, you will be able to fork Mainnet straight away. Run the below command in your terminal:

Make sure that you:

- Replace your API Key (get one by heading to Chainnodes)
Replace the block number with a recent one, check Etherscan for that

- If you fork a non-Ethereum Mainnet chain, check Chainlist for the correct chain id and replace both occurrences in the command below

- set `NEXT_PUBLIC_ENABLE_HARDHAT=true` in development in order to show hardhat as a valid network

  ```bash
  anvil --fork-url https://mainnet.chainnodes.org/ef0128ec-0740 -438d-b447-28226b3a8569 --fork-block-number 20290802 --fork-chain-id 1 --chain-id 12
  ```

