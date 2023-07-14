import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { BRIDGES } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
import { Transaction, TransactionStatus } from '../../pages/Account/Account.types'
import { formatTransactions } from '../../pages/Account/utils/accountUtils'
import { useLimitOrderTransactions } from '../../pages/Swap/LimitOrderBox/utils/hooks'
import { useAllBridgeTransactions, useAllSwapTransactions } from '../../state/transactions/hooks'
import { sortByTimeStamp } from '../../utils/sortByTimestamp'

import { AdvancedViewTransaction } from './advancedTradingView.types'
import {
  selectAllDataFromAdapters,
  selectHasMoreData,
  selectUniswapV3AllData,
} from './store/advancedTradingView.selectors'

export const useAllTrades = (): {
  transactions: Transaction[]
  tradeHistory: Required<AdvancedViewTransaction>[]
  liquidityHistory: AdvancedViewTransaction[]
  hasMore: { hasMoreActivity: boolean; hasMoreTrades: boolean }
} => {
  const { account, chainId } = useActiveWeb3React()
  const hasMore = useSelector(selectHasMoreData)
  const { uniswapV3LiquidityHistory, uniswapV3TradeHistory } = useSelector(selectUniswapV3AllData)
  const { baseAdapterTradeHistory, baseAdapterLiquidityHistory } = useSelector(selectAllDataFromAdapters)

  const allSwapTransactions = useAllSwapTransactions()
  const allLimitOrderTransactions = useLimitOrderTransactions(chainId, account)

  const allSwapBridgeTransactions = useAllBridgeTransactions(true).filter(
    transaction =>
      transaction.bridgeId === BRIDGES.SOCKET.id && transaction.sellToken.symbol !== transaction.buyToken.symbol
  )

  const transactions = useMemo(() => {
    if (account) {
      const formattedTransactions = formatTransactions(
        allSwapTransactions,
        allSwapBridgeTransactions,
        allLimitOrderTransactions,
        false,
        account,
        null
      )

      const pendingTransactions = formattedTransactions
        .filter(
          tx =>
            tx.status.toUpperCase() === TransactionStatus.PENDING ||
            tx.status.toUpperCase() === TransactionStatus.REDEEM
        )
        .splice(0, 5)

      if (pendingTransactions.length === 5) return pendingTransactions

      const formattedTransactionsWithoutPending = formattedTransactions
        .filter(
          transaction =>
            transaction.status.toUpperCase() !== TransactionStatus.PENDING &&
            transaction.status.toUpperCase() !== TransactionStatus.REDEEM
        )
        .splice(0, 5 - pendingTransactions.length)
        // Sort by confirmation time
        .sort((a, b) => {
          return Number(b.confirmedTime) - Number(a.confirmedTime)
        })

      return [...pendingTransactions, ...formattedTransactionsWithoutPending]
    }

    return []
  }, [account, allLimitOrderTransactions, allSwapBridgeTransactions, allSwapTransactions])

  const tradeHistory = [...baseAdapterTradeHistory, ...uniswapV3TradeHistory].sort((firstTrade, secondTrade) =>
    sortByTimeStamp(firstTrade.timestamp, secondTrade.timestamp)
  )

  const liquidityHistory = [...baseAdapterLiquidityHistory, ...uniswapV3LiquidityHistory].sort(
    (firstTrade, secondTrade) => {
      return sortByTimeStamp(firstTrade.timestamp, secondTrade.timestamp)
    }
  )

  return {
    transactions,
    tradeHistory,
    liquidityHistory,
    hasMore,
  }
}
