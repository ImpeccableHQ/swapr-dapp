import { createSelector } from '@reduxjs/toolkit'

import { AppState } from '../../../state'
import { BridgeTransactionStatus, BridgeTransactionSummary } from '../../../state/bridgeTransactions/types'
import { normalizeInputValue } from '../../../utils'
import { BridgeIds, OmniBridgeIdList } from '../EcoBridge.types'

import { omniTransactionsAdapter } from './OmniBridge.adapter'
import { getTransactionStatus } from './OmniBridge.utils'

const createSelectOwnedTransactions = (bridgeId: OmniBridgeIdList) => {
  const transactionsSelector = createSelector(
    [(state: AppState) => state.ecoBridge[bridgeId].transactions],
    transactions => omniTransactionsAdapter.getSelectors().selectAll(transactions)
  )

  return createSelector(
    [transactionsSelector, (state: AppState, account: string | undefined) => account],
    (txs, account) => {
      if (account) {
        const normalizedAccount = account.toLowerCase()

        return txs.filter(tx => tx.sender.toLowerCase() === normalizedAccount)
      }
      return []
    }
  )
}

const createSelectBridgeTransactionsSummary = (
  bridgeId: OmniBridgeIdList,
  selectOwnedTxs: ReturnType<typeof createSelectOwnedTransactions>
) =>
  createSelector([selectOwnedTxs], txs => {
    const summaries = txs.map(tx => {
      const {
        txHash,
        fromValue,
        toValue,
        timestampResolved,
        assetName,
        fromChainId,
        toChainId,
        partnerTxHash,
        status,
        message,
        assetAddressL1,
        assetAddressL2,
      } = tx

      const isClaimed = !!partnerTxHash
      const isFailed = !!partnerTxHash && status === false
      const hasSignatures = message && message.signatures && message.messageData ? true : false

      const transactionStatus = getTransactionStatus(status, isClaimed, isFailed, hasSignatures)

      const pendingReason = status === BridgeTransactionStatus.PENDING ? 'Transaction has not been confirmed yet' : ''

      const normalizedFromValue = normalizeInputValue(fromValue, true)
      const normalizedToValue = normalizeInputValue(toValue, true)

      const summary: BridgeTransactionSummary = {
        txHash,
        assetName,
        fromValue: normalizedFromValue,
        toValue: normalizedToValue,
        fromChainId,
        toChainId,
        log: [{ chainId: fromChainId, txHash: txHash }],
        bridgeId,
        status: transactionStatus,
        pendingReason,
        assetAddressL1,
        assetAddressL2,
      }

      if (partnerTxHash) {
        summary.log.push({ chainId: toChainId, txHash: partnerTxHash })
      }
      if (
        transactionStatus === BridgeTransactionStatus.CLAIMED ||
        transactionStatus === BridgeTransactionStatus.CONFIRMED
      ) {
        summary.timestampResolved = timestampResolved
      }

      return summary
    })
    return summaries
  })

const createSelectPendingTransactions = (selectOwnedTxs: ReturnType<typeof createSelectOwnedTransactions>) =>
  createSelector([selectOwnedTxs], txs => txs.filter(tx => tx.status === BridgeTransactionStatus.PENDING))

const createSelectAllTransactions = (bridgeId: OmniBridgeIdList) =>
  createSelector([(state: AppState) => state.ecoBridge[bridgeId].transactions], txs =>
    omniTransactionsAdapter.getSelectors().selectAll(txs)
  )

export interface OmniBridgeSelectors {
  selectOwnedTransactions: ReturnType<typeof createSelectOwnedTransactions>
  selectBridgeTransactionsSummary: ReturnType<typeof createSelectBridgeTransactionsSummary>
  selectPendingTransactions: ReturnType<typeof createSelectPendingTransactions>
  selectAllTransactions: ReturnType<typeof createSelectAllTransactions>
}

export const omniBridgeSelectorsFactory = (omniBridges: OmniBridgeIdList[]) => {
  return omniBridges.reduce(
    (total, bridgeId) => {
      const selectOwnedTransactions = createSelectOwnedTransactions(bridgeId)
      const selectBridgeTransactionsSummary = createSelectBridgeTransactionsSummary(bridgeId, selectOwnedTransactions)
      const selectPendingTransactions = createSelectPendingTransactions(selectOwnedTransactions)
      const selectAllTransactions = createSelectAllTransactions(bridgeId)

      const selectors = {
        selectOwnedTransactions,
        selectBridgeTransactionsSummary,
        selectPendingTransactions,
        selectAllTransactions,
      }

      total[bridgeId] = selectors
      return total
    },
    {} as {
      [k in OmniBridgeIdList]: OmniBridgeSelectors
    }
  )
}

export const omniBridgeSelectors = omniBridgeSelectorsFactory([BridgeIds.OMNIBRIDGE])
