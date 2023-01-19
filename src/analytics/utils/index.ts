import { Trade } from '@swapr/sdk'

import { BridgeTransactionSummary } from '../../state/bridgeTransactions/types'

/**
 * Creates an unique ID for a trade and bridge transaction instance.
 * @param item
 * @returns
 */
export function computeItemId(item: Trade | BridgeTransactionSummary) {
  if (item instanceof Trade) {
    return `${item.platform.name.toLowerCase()}-${item.chainId}/${item.inputAmount.currency.address}-${
      item.outputAmount.currency.address
    }-${item.inputAmount.raw.toString()}-${item.outputAmount.raw.toString()}`
  }

  // the ID is not meant to be readable, it's just a unique identifier
  return `ecoBridge/${item.bridgeId.toLowerCase()}/${item.fromChainId}:${item.toChainId}/${item.fromValue}:${
    item.toValue
  }`
}
