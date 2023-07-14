import { getAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'
import { AddressZero } from '@ethersproject/constants'
import { Contract } from '@ethersproject/contracts'
import { JsonRpcProvider, JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import IDXswapRouter from '@swapr/periphery/build/IDXswapRouter.json'
import { ChainId, Currency, CurrencyAmount, JSBI, Pair, Percent, Token, UniswapV2RoutablePlatform } from '@swapr/sdk'

import Decimal from 'decimal.js-light'
import { commify } from 'ethers/lib/utils'

import { BRIDGES, NetworkDetails } from '../constants'
import { TokenAddressMap } from '../state/lists/hooks'
import { SwapProtocol } from '../state/transactions/reducer'

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
  try {
    return getAddress(value)
  } catch {
    return false
  }
}

const ETHERSCAN_PREFIXES: { [chainId in ChainId | number]: string } = {
  1: '',
  4: 'rinkeby.',
  [ChainId.ARBITRUM_ONE]: '',
  [ChainId.ARBITRUM_RINKEBY]: '',
  [ChainId.XDAI]: '',
}

/**
 * @TODO in https://linear.app/swaprdev/issue/SWA-65/provide-a-single-source-of-truth-for-chain-rpcs-from-the-sdk
 * [] Abstract chains explorers into a single source of truth and consume it where neded
 */
const getExplorerPrefix = (chainId: ChainId) => {
  switch (chainId) {
    case ChainId.ARBITRUM_ONE:
      return new URL('https://arbiscan.io')
    case ChainId.ARBITRUM_RINKEBY:
      return new URL('https://testnet.arbiscan.io')
    case ChainId.XDAI:
      return new URL('https://gnosisscan.io')
    case ChainId.POLYGON:
      return new URL('https://polygonscan.com')
    case ChainId.OPTIMISM_MAINNET:
      return new URL('https://optimistic.etherscan.io')
    case ChainId.BSC_MAINNET:
      return new URL('https://bscscan.com')
    case ChainId.BSC_TESTNET:
      return new URL('https://testnet.bscscan.com/')
    case ChainId.ZK_SYNC_ERA_MAINNET:
      return new URL('https://explorer.zksync.io/')
    case ChainId.ZK_SYNC_ERA_TESTNET:
      return new URL('https://goerli.explorer.zksync.io/')
    default:
      return new URL(`https://${ETHERSCAN_PREFIXES[chainId] || ETHERSCAN_PREFIXES[1]}etherscan.io`)
  }
}

export const EXPLORER_LINK_TYPE: Record<string, string> = {
  transaction: 'transaction',
  token: 'token',
  address: 'address',
  block: 'block',
}

export function getExplorerLink(
  chainId: ChainId,
  hash: string,
  type: keyof typeof EXPLORER_LINK_TYPE,
  protocol?: string
): string {
  //exception with using cow swap. Need to show cow explorer
  if (protocol?.toUpperCase() === SwapProtocol.COW) {
    return getGnosisProtocolExplorerOrderLink(chainId, hash)
  }

  if (protocol === BRIDGES.SOCKET.id) return getSocketExplorerLink(hash)

  const prefix = getExplorerPrefix(chainId)
  // exception. blockscout doesn't have a token-specific address
  if (chainId === ChainId.XDAI && type === EXPLORER_LINK_TYPE.token) {
    return new URL(`/address/${hash}`, prefix).href
  }

  switch (type) {
    case EXPLORER_LINK_TYPE.transaction: {
      return new URL(`/tx/${hash}`, prefix).href
    }
    case EXPLORER_LINK_TYPE.token: {
      return new URL(`/token/${hash}`, prefix).href
    }
    case EXPLORER_LINK_TYPE.block: {
      return new URL(`/block/${hash}`, prefix).href
    }
    case EXPLORER_LINK_TYPE.address:
    default: {
      return new URL(`/address/${hash}`, prefix).href
    }
  }
}

export function getAccountAnalyticsLink(account: string, chainId: ChainId | undefined): string {
  return account
    ? `https://dxstats.eth.limo/#/account/${account}?chainId=${chainId}`
    : `https://dxstats.eth.limo/#/accounts?chainId=${chainId}`
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, charsBefore = 4, charsAfter = 4): string {
  const parsed = isAddress(address)
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return `${parsed.substring(0, charsBefore + 2)}...${parsed.substring(42 - charsAfter)}`
}

//get component name with spacing between camel case
export function componentName(component: React.FunctionComponent): string {
  const componentName = component.displayName
  if (componentName) return componentName.replace(/([a-z])([A-Z])/g, '$1 $2')
  return ''
}

// add 10%
export function calculateGasMargin(value: BigNumber): BigNumber {
  return value.mul(BigNumber.from(10000).add(BigNumber.from(1000))).div(BigNumber.from(10000))
}

// converts a basis points value to a sdk percent
export function basisPointsToPercent(num: number): Percent {
  return new Percent(JSBI.BigInt(num), JSBI.BigInt(10000))
}

export function calculateSlippageAmount(value: CurrencyAmount, slippage: number): [JSBI, JSBI] {
  if (slippage < 0 || slippage > 10000) {
    throw Error(`Unexpected slippage value: ${slippage}`)
  }
  return [
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 - slippage)), JSBI.BigInt(10000)),
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 + slippage)), JSBI.BigInt(10000)),
  ]
}

// account is not optional
export function getSigner(library: Web3Provider | JsonRpcProvider, account: string): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked()
}

// account is optional
export function getProviderOrSigner(
  library: Web3Provider | JsonRpcProvider,
  account?: string
): Web3Provider | JsonRpcProvider | JsonRpcSigner {
  return account ? getSigner(library, account) : library
}

// account is optional
export function getContract(address: string, ABI: any, library: Web3Provider, account?: string): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return new Contract(address, ABI, getProviderOrSigner(library, account) as any)
}

// account is optional
export function getRouterContract(
  chainId: ChainId,
  library: Web3Provider,
  platform: UniswapV2RoutablePlatform,
  account?: string
): Contract {
  return getContract(
    platform.routerAddress[chainId ? chainId : ChainId.MAINNET] as string,
    IDXswapRouter.abi,
    library,
    account
  )
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

interface ImageType {
  name: string
  location: string
}
export function exportAllImagesFilesFromRelativePath(folderArray: any): ImageType[] | [] {
  const images: ImageType[] = []

  folderArray.keys().forEach((item: string) => {
    const imageName = item.substring(item.indexOf('./') + 2, item.lastIndexOf('.'))
    const imageLocation = folderArray(item)

    images.push({ name: imageName, location: imageLocation })
  })
  return images
}

export function isTokenOnList(defaultTokens: TokenAddressMap, currency: Currency): boolean {
  if (Currency.isNative(currency)) return true
  return Boolean(currency instanceof Token && defaultTokens[currency.chainId]?.[currency.address])
}

export function isPairOnList(pairs: Pair[], pair?: Pair): boolean {
  if (!pair) return false
  return !!pairs.find(loopedPair => loopedPair.equals(pair))
}

export const formatCurrencyAmount = (amount: CurrencyAmount, significantDecimalPlaces = 2): string => {
  const decimalAmount = new Decimal(amount.toExact())
  if (decimalAmount.lessThan('0.00000001')) {
    return '0.00'
  }
  const decimalPlaces = decimalAmount.decimalPlaces()
  if (decimalPlaces === 0) {
    return commify(decimalAmount.toString())
  }
  const [integers, decimals] = decimalAmount.toFixed(decimalPlaces).split('.')
  let adjustedDecimals = ''
  let significantDecimalPlacesAdded = 0
  for (let i = 0; i < decimals.length; i++) {
    const char = decimals.charAt(i)
    if (significantDecimalPlacesAdded === 1 && char === '0') {
      // handle cases like 0.0010001, stopping at the first 1
      break
    }
    adjustedDecimals += char
    if (char !== '0' && ++significantDecimalPlacesAdded === significantDecimalPlaces) {
      break
    }
  }
  return `${commify(integers)}.${adjustedDecimals}`
}

export const calculatePercentage = (value: number, percentage: number): number => {
  return Math.round((percentage / 100) * value)
}

export const switchOrAddNetwork = (networkDetails?: NetworkDetails, account?: string) => {
  if (!window.ethereum || !window.ethereum.request || !window.ethereum.isMetaMask || !networkDetails || !account)
    return Promise.reject()
  return window.ethereum
    .request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: networkDetails.chainId }],
    })
    .catch(error => {
      if (error.code !== 4902) {
        console.error('error switching to chain id', networkDetails.chainId, error)
      }
      if (!window.ethereum || !window.ethereum.request) return
      window.ethereum
        .request({
          method: 'wallet_addEthereumChain',
          params: [{ ...networkDetails }, account],
        })
        .catch(error => {
          console.error('error adding chain with id', networkDetails.chainId, error)
        })
    })
}

export const normalizeInputValue = (val: string, strictFormat?: boolean) => {
  const normalizedValue = val.replace(/^0+(?=\d+)/, '').replace(/^\./, '0.')

  return strictFormat
    ? normalizedValue.replace(/^([\d,]+)$|^([\d,]+)\.0*$|^([\d,]+\.[0-9]*?)0*$/, '$1$2$3')
    : normalizedValue
}

export function getSocketExplorerLink(transactionHash: string) {
  return new URL(`https://socketscan.io/tx/${transactionHash}`).href
}

/**
 * Gnosis Protocol Explorer Base URL list
 */
const GNOSIS_PROTOCOL_EXPLORER_BASE_URL = {
  [ChainId.MAINNET]: new URL('https://explorer.cow.fi'),
  [ChainId.RINKEBY]: new URL('https://explorer.cow.fi/rinkeby'),
  [ChainId.XDAI]: new URL('https://explorer.cow.fi/xdai'),
}

/**
 * Returns the Gnosis Protocol Explorer Base link
 * @param chainId the chain Id
 * @returns the explorer URL for given chain ID
 */
export function getGnosisProtocolExplorerLink(chainId: ChainId): URL {
  return GNOSIS_PROTOCOL_EXPLORER_BASE_URL[chainId as keyof typeof GNOSIS_PROTOCOL_EXPLORER_BASE_URL]
}

/**
 * Returns the Gnosis Protocol Explorer order link
 * @param chainId the chain Id
 * @param orderId the order ID
 * @returns the order link
 */
export function getGnosisProtocolExplorerOrderLink(chainId: ChainId, orderId: string): string {
  return new URL(`/orders/${orderId}`, getGnosisProtocolExplorerLink(chainId)).href
}

/**
 * Returns the Gnosis Protocol Explorer order link
 * @param chainId the chain Id
 * @param address the order address
 * @returns the order link
 */
export function getGnosisProtocolExplorerAddressLink(chainId: ChainId, address: string): string {
  return new URL(`/address/${address}`, getGnosisProtocolExplorerLink(chainId)).href
}
