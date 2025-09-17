/**
 * Lightweight Web3 utilities using native window.ethereum API
 * No external dependencies required
 */

// EVM Networks (Test Networks + Optimism Mainnet)
export const TEST_NETWORKS = {
  sepolia: {
    chainId: '0xaa36a7', // 11155111
    chainName: 'Sepolia Test Network',
    nativeCurrency: {
      name: 'SepoliaETH',
      symbol: 'SEP',
      decimals: 18,
    },
    rpcUrls: ['https://sepolia.infura.io/v3/'],
    blockExplorerUrls: ['https://sepolia.etherscan.io/'],
  },
  goerli: {
    chainId: '0x5', // 5
    chainName: 'Goerli Test Network',
    nativeCurrency: {
      name: 'GoerliETH',
      symbol: 'GOR',
      decimals: 18,
    },
    rpcUrls: ['https://goerli.infura.io/v3/'],
    blockExplorerUrls: ['https://goerli.etherscan.io/'],
  },
  mumbai: {
    chainId: '0x13881', // 80001
    chainName: 'Mumbai Testnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
  },
  optimism: {
    chainId: '0xa', // 10
    chainName: 'Optimism Mainnet',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.optimism.io'],
    blockExplorerUrls: ['https://optimistic.etherscan.io/'],
  },
} as const

export type NetworkKey = keyof typeof TEST_NETWORKS

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, callback: (data: any) => void) => void
      removeListener: (event: string, callback: (data: any) => void) => void
    }
  }
}

export class Web3Wallet {
  private ethereum: NonNullable<Window['ethereum']>

  constructor() {
    if (!window.ethereum) {
      throw new Error('No Web3 wallet detected. Please install MetaMask or another EVM wallet.')
    }
    this.ethereum = window.ethereum
  }

  /**
   * Check if wallet is installed
   */
  static isWalletInstalled(): boolean {
    return typeof window !== 'undefined' && !!window.ethereum
  }

  /**
   * Connect wallet and get accounts
   */
  async connect(): Promise<string[]> {
    try {
      const accounts = await this.ethereum.request({
        method: 'eth_requestAccounts'
      })
      return accounts
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('User rejected the connection request')
      }
      throw new Error(`Failed to connect wallet: ${error.message}`)
    }
  }

  /**
   * Get current connected accounts
   */
  async getAccounts(): Promise<string[]> {
    return await this.ethereum.request({
      method: 'eth_accounts'
    })
  }

  /**
   * Get current network chain ID
   */
  async getChainId(): Promise<string> {
    return await this.ethereum.request({
      method: 'eth_chainId'
    })
  }

  /**
   * Switch to a specific test network
   */
  async switchNetwork(networkKey: NetworkKey): Promise<void> {
    const network = TEST_NETWORKS[networkKey]
    
    try {
      // Try to switch to the network
      await this.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }],
      })
    } catch (error: any) {
      // If network doesn't exist, add it
      if (error.code === 4902) {
        await this.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [network],
        })
      } else {
        throw new Error(`Failed to switch network: ${error.message}`)
      }
    }
  }

  /**
   * Sign a message using personal_sign
   */
  async signMessage(message: string, account: string): Promise<string> {
    try {
      // Convert message to hex using browser-compatible method
      const messageHex = '0x' + Array.from(new TextEncoder().encode(message))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
      
      const signature = await this.ethereum.request({
        method: 'personal_sign',
        params: [messageHex, account],
      })
      
      return signature
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('User rejected the signature request')
      }
      throw new Error(`Failed to sign message: ${error.message}`)
    }
  }

  /**
   * Listen for account changes
   */
  onAccountsChanged(callback: (accounts: string[]) => void): void {
    this.ethereum.on('accountsChanged', callback)
  }

  /**
   * Listen for network changes
   */
  onChainChanged(callback: (chainId: string) => void): void {
    this.ethereum.on('chainChanged', callback)
  }

  /**
   * Remove event listeners
   */
  removeAllListeners(): void {
    if (this.ethereum.removeListener) {
      this.ethereum.removeListener('accountsChanged', () => {})
      this.ethereum.removeListener('chainChanged', () => {})
    }
  }
}

/**
 * Verify a signature (client-side basic validation)
 */
export function isValidSignature(signature: string): boolean {
  // Basic validation: should be 132 characters (0x + 130 hex chars)
  return /^0x[a-fA-F0-9]{130}$/.test(signature)
}

/**
 * Get network name from chain ID
 */
export function getNetworkName(chainId: string): string {
  const networks = Object.entries(TEST_NETWORKS).find(([_, network]) => 
    network.chainId.toLowerCase() === chainId.toLowerCase()
  )
  return networks ? networks[0] : 'Unknown Network'
}

/**
 * Format wallet address for display
 */
export function formatAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
