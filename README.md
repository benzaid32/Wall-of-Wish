# Wall of Wishes - Solana Blockchain App

A decentralized application that allows users to submit wishes and store them permanently on the Solana blockchain.

## Features

- Connect any Solana wallet (Phantom, Solflare, etc.)
- Submit wishes that are stored directly as Program Derived Addresses (PDAs) on Solana
- View all wishes stored on the blockchain
- Runs on Solana Devnet

## Technical Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Blockchain**: Solana (Devnet)
- **Smart Contract**: Anchor Framework
- **Wallet Adapter**: Solana Wallet Adapter

## Getting Started

### Prerequisites

- Node.js v16+ and npm/yarn/bun
- Solana CLI tools (for development)
- An Anchor development environment
- A Solana wallet (Phantom, Solflare, etc.)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd wall-of-wishes
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. Start the development server:
   ```
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Deployment

The Anchor program is already deployed on Solana Devnet at the address specified in the code.

## Implementation Details

- Uses Anchor to define the program structure
- Implements PDAs (Program Derived Addresses) to store wish data
- Each wish is stored as a unique PDA derived from the user's public key and the wish title
- The frontend directly interacts with the Solana blockchain, without any intermediate database

## License

MIT
