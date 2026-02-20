import { createConfig, http } from 'wagmi';
import { bsc, mainnet } from 'wagmi/chains';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { walletConnect, injected, coinbaseWallet } from 'wagmi/connectors';

// WalletConnect Project ID
const projectId = 'dc07f2192374242b07adb70fa5d5903c';

// PIOGOLD Custom Chain
export const piogold = {
    id: 42357,
    name: 'PIOGOLD Mainnet',
    nativeCurrency: {
        decimals: 18,
        name: 'PIOGOLD',
        symbol: 'PIO',
    },
    rpcUrls: {
        default: {
            http: ['https://datasheed.pioscan.com'],
        },
    },
    blockExplorers: {
        default: {
            name: 'PioScan',
            url: 'https://pioscan.com',
        },
    },
};

// Metadata
const metadata = {
    name: 'PIOGOLD ICO',
    description: 'Buy PIO with USDT - Gold-Backed Cryptocurrency',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://piogold.com',
    icons: ['https://piogold.com/icon.png'],
};

// Configure chains
const chains = [bsc, piogold, mainnet];

// Create wagmi config
export const config = createConfig({
    chains,
    connectors: [
        walletConnect({ projectId, metadata, showQrModal: false }),
        injected({ shimDisconnect: true }),
        coinbaseWallet({ appName: metadata.name }),
    ],
    transports: {
        [bsc.id]: http('https://bsc-dataseed.binance.org'),
        [piogold.id]: http('https://datasheed.pioscan.com'),
        [mainnet.id]: http(),
    },
});

// Create Web3Modal
createWeb3Modal({
    wagmiConfig: config,
    projectId,
    chains,
    defaultChain: bsc,
    themeMode: 'dark',
    themeVariables: {
        '--w3m-font-family': 'Manrope, sans-serif',
        '--w3m-accent': '#D4AF37',
        '--w3m-color-mix': '#050505',
        '--w3m-color-mix-strength': 40,
        '--w3m-border-radius-master': '8px',
    },
    featuredWalletIds: [
        'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
        '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
        '5264c71ba09c8c5fb8ca66ba8c2b5f98dd8b95d6f9c9b6d1e5e5a9c2b9a64f8a', // OKX
    ],
});

// USDT Contract Address on BSC
export const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';

// USDT ABI (minimal for transfer)
export const USDT_ABI = [
    {
        constant: false,
        inputs: [
            { name: '_to', type: 'address' },
            { name: '_value', type: 'uint256' }
        ],
        name: 'transfer',
        outputs: [{ name: '', type: 'bool' }],
        type: 'function'
    },
    {
        constant: true,
        inputs: [{ name: '_owner', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: 'balance', type: 'uint256' }],
        type: 'function'
    },
    {
        constant: true,
        inputs: [],
        name: 'decimals',
        outputs: [{ name: '', type: 'uint8' }],
        type: 'function'
    },
    {
        constant: false,
        inputs: [
            { name: '_spender', type: 'address' },
            { name: '_value', type: 'uint256' }
        ],
        name: 'approve',
        outputs: [{ name: '', type: 'bool' }],
        type: 'function'
    }
];
