import { ChainId } from '@swapr/sdk'
import EtherLogo from '../../assets/images/ether-logo.png'
import XDAILogo from '../../assets/images/xdai-logo.png'

export const NATIVE_CURRENCY_LOGO: { [chainId in ChainId]: string } = {
  [ChainId.ARBITRUM_ONE]: EtherLogo,
  [ChainId.ARBITRUM_RINKEBY]: EtherLogo,
  [ChainId.MAINNET]: EtherLogo,
  [ChainId.RINKEBY]: EtherLogo,
  [ChainId.XDAI]: XDAILogo
}

// From repo https://github.com/trustwallet/assets/tree/master/blockchains
const trustWalletChainMapping: { [chainId in ChainId]?: string } = {
  [ChainId.XDAI]: 'xdai',
  [ChainId.ARBITRUM_ONE]: 'arbitrum',
  [ChainId.MAINNET]: 'ethereum'
}

export const getTokenLogoURL = (address: string, chainId = ChainId.MAINNET) => {
  const chainKey = trustWalletChainMapping[chainId] || 'ethereum'

  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chainKey}/assets/${address}/logo.png`
}
