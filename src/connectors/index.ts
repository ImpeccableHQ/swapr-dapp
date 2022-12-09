import { ChainId } from '@swapr/sdk'

import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { initializeConnector, Web3ReactHooks } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { Connector } from '@web3-react/types'
import { WalletConnect } from '@web3-react/walletconnect'

import SWAPR_LOGO from './../assets/images/swapr.svg'
import { ConnectorType, RPC_URLS } from './../constants'

export interface Connection {
  connector: Connector
  hooks: Web3ReactHooks
  type: ConnectorType
}

function onError(error: Error) {
  console.debug(`web3-react error: ${error}`)
}

// Network
export const [web3Network, web3NetworkHooks] = initializeConnector<Network>(
  actions =>
    new Network({
      actions,
      urlMap: RPC_URLS,
      defaultChainId: ChainId.MAINNET,
    })
)

export const networkConnection: Connection = {
  connector: web3Network,
  hooks: web3NetworkHooks,
  type: ConnectorType.NETWORK,
}

// MetaMask
export const [metaMask, metaMaskHooks] = initializeConnector<MetaMask>(actions => new MetaMask({ actions, onError }))

export const metaMaskConnection: Connection = {
  connector: metaMask,
  hooks: metaMaskHooks,
  type: ConnectorType.METAMASK,
}

//Wallet Connect
export const [walletConnect, walletConnectHooks] = initializeConnector<WalletConnect>(
  actions =>
    new WalletConnect({
      actions,
      options: {
        rpc: RPC_URLS,
      },
      onError,
    })
)

export const walletConnectConnection: Connection = {
  connector: walletConnect,
  hooks: walletConnectHooks,
  type: ConnectorType.WALLET_CONNECT,
}

// Coinbase
export const [coinbaseWallet, coinbaseWalletHooks] = initializeConnector<CoinbaseWallet>(
  actions =>
    new CoinbaseWallet({
      actions,
      options: {
        url: RPC_URLS[ChainId.MAINNET],
        appName: 'Swapr',
        appLogoUrl: SWAPR_LOGO,
      },
      onError,
    })
)

export const coinbaseWalletConnection: Connection = {
  connector: coinbaseWallet,
  hooks: coinbaseWalletHooks,
  type: ConnectorType.COINBASE,
}

export const CONNECTIONS: Connection[] = [
  metaMaskConnection,
  coinbaseWalletConnection,
  walletConnectConnection,
  networkConnection,
]

export const connectors: [Connector, Web3ReactHooks][] = [
  [metaMask, metaMaskHooks],
  [walletConnect, walletConnectHooks],
  [coinbaseWallet, coinbaseWalletHooks],
  [web3Network, web3NetworkHooks],
]
