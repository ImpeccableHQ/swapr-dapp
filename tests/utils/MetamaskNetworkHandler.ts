import { Network } from './TestTypes'

export class MetamaskNetworkHandler {
  static addGnosis() {
    cy.addMetamaskNetwork({
      networkName: 'gnosis chain',
      rpcUrl: 'https://rpc.gnosischain.com/',
      chainId: '100',
      symbol: 'xDai',
      blockExplorer: 'https://blockscout.com/xdai/mainnet',
      isTestnet: true,
    })
  }
  static addARinkeby() {
    cy.addMetamaskNetwork({
      networkName: 'arbitrum rinkeby',
      rpcUrl: 'https://rinkeby.arbitrum.io/rpc',
      chainId: '421611',
      symbol: 'ETH',
      blockExplorer: 'https://rinkeby-explorer.arbitrum.io/#/',
      isTestnet: true,
    })
  }
  static switchToNetworkIfNotConnected(desiredNetwork: string = 'rinkeby') {
    cy.changeMetamaskNetwork(desiredNetwork)
  }
}
