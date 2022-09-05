import { Pair, RoutablePlatform, Token, UniswapV2RoutablePlatform } from '@swapr/sdk'

import { createSelector } from '@reduxjs/toolkit'

import { AppState } from '../../state'
import { AllTradesAndLiquidityFromAdapters, BasePair, SwapsWithLogo } from './adapters/baseAdapter/base.types'
import {
  AllTradesAndLiquidityFromUniswapV3Adapters,
  BasePair as BasePairUniswapV3,
  UniswapV3SwapsWithLogo,
} from './adapters/uniswapV3/uniswapV3.types'
import { AdapterKeys, AdvancedViewTransaction } from './advancedTradingView.types'

const adapterLogos: { [key in AdapterKeys]: string } = {
  swapr: UniswapV2RoutablePlatform.SWAPR.name,
  sushiswap: UniswapV2RoutablePlatform.SUSHISWAP.name,
  uniswapV2: UniswapV2RoutablePlatform.UNISWAP.name,
  honeyswap: UniswapV2RoutablePlatform.HONEYSWAP.name,
  uniswapV3: RoutablePlatform.UNISWAP.name,
}

export const sortsBeforeTokens = (inputToken: Token, outputToken: Token) =>
  inputToken.sortsBefore(outputToken) ? [inputToken, outputToken] : [outputToken, inputToken]

const getAdapterPair = (key: AdapterKeys, platform?: UniswapV2RoutablePlatform) =>
  createSelector(
    [(state: AppState) => state.advancedTradingView.pair, (state: AppState) => state.advancedTradingView.adapters[key]],
    ({ inputToken, outputToken }, adapterPairs) => {
      if (inputToken && outputToken) {
        try {
          const pairId = Pair.getAddress(inputToken, outputToken, platform).toLowerCase()
          return {
            pair: adapterPairs[pairId] as BasePair | BasePairUniswapV3,
            logoKey: adapterLogos[key],
          }
        } catch {}
      }
    }
  )

const selectCurrentSwaprPair = getAdapterPair(AdapterKeys.SWAPR, UniswapV2RoutablePlatform.SWAPR)
const selectCurrentSushiPair = getAdapterPair(AdapterKeys.SUSHISWAP, UniswapV2RoutablePlatform.SUSHISWAP)
const selectCurrentUniswapV2Pair = getAdapterPair(AdapterKeys.UNISWAPV2, UniswapV2RoutablePlatform.UNISWAP)
const selectCurrentHoneyPair = getAdapterPair(AdapterKeys.HONEYSWAP, UniswapV2RoutablePlatform.HONEYSWAP)
const selectCurrentUniswapV3Pair = getAdapterPair(AdapterKeys.UNISWAPV3)

const selectAllCurrentPairs = createSelector(
  [selectCurrentSwaprPair, selectCurrentSushiPair, selectCurrentUniswapV2Pair, selectCurrentHoneyPair],
  (...pairs) =>
    pairs.reduce<AllTradesAndLiquidityFromAdapters>(
      (dataFromAllAdapters, adapterPair) => {
        if (adapterPair?.pair?.swaps) {
          dataFromAllAdapters.swaps = [
            ...dataFromAllAdapters.swaps,
            ...(adapterPair.pair.swaps.data.map(tx => ({ ...tx, logoKey: adapterPair.logoKey })) as SwapsWithLogo[]),
          ]
        }

        if (adapterPair?.pair?.burnsAndMints) {
          dataFromAllAdapters.burnsAndMints = [
            ...dataFromAllAdapters.burnsAndMints,
            ...adapterPair.pair.burnsAndMints.data.map(tx => ({ ...tx, logoKey: adapterPair.logoKey })),
          ]
        }

        return dataFromAllAdapters
      },
      { swaps: [], burnsAndMints: [] }
    )
)

const selectAllUniswapV3CurrentPairs = createSelector([selectCurrentUniswapV3Pair], (...pairs) =>
  pairs.reduce<AllTradesAndLiquidityFromUniswapV3Adapters>(
    (dataFromAllAdapters, adapterPair) => {
      if (adapterPair?.pair?.swaps) {
        dataFromAllAdapters.swaps = [
          ...dataFromAllAdapters.swaps,
          ...(adapterPair.pair.swaps.data.map(tx => ({
            ...tx,
            logoKey: adapterPair.logoKey,
          })) as UniswapV3SwapsWithLogo[]),
        ]
      }

      if (adapterPair?.pair?.burnsAndMints) {
        dataFromAllAdapters.burnsAndMints = [
          ...dataFromAllAdapters.burnsAndMints,
          ...adapterPair.pair.burnsAndMints.data.map(tx => ({ ...tx, logoKey: adapterPair.logoKey })),
        ]
      }

      return dataFromAllAdapters
    },
    { swaps: [], burnsAndMints: [] }
  )
)

const identity = (x: boolean) => x

export const selectHasMoreData = createSelector(
  [
    selectCurrentSwaprPair,
    selectCurrentSushiPair,
    selectCurrentUniswapV2Pair,
    selectCurrentHoneyPair,
    selectCurrentUniswapV3Pair,
  ],
  (...pairs) => ({
    hasMoreTrades: pairs.map(pair => pair?.pair?.swaps?.hasMore ?? true).some(identity),
    hasMoreActivity: pairs.map(pair => pair?.pair?.burnsAndMints?.hasMore ?? true).some(identity),
  })
)

export const selectAllDataFromAdapters = createSelector(
  [selectAllCurrentPairs, (state: AppState) => state.advancedTradingView.pair],
  (pair, { inputToken, outputToken }) => {
    if (!inputToken || !outputToken || !pair)
      return {
        baseAdapterTradeHistory: [],
        baseAdapterLiquidityHistory: [],
      }

    const [token0, token1] = sortsBeforeTokens(inputToken, outputToken)

    const { burnsAndMints, swaps } = pair

    const baseAdapterLiquidityHistory: AdvancedViewTransaction[] = burnsAndMints.map(trade => {
      const {
        transaction: { id },
        amount0,
        amount1,
        timestamp,
        logoKey,
      } = trade
      return {
        transactionId: id,
        amountIn: `${amount0} ${token0.symbol}`,
        amountOut: `${amount1} ${token1.symbol}`,
        timestamp,
        logoKey,
      }
    })
    const baseAdapterTradeHistory: Required<AdvancedViewTransaction>[] = swaps.map(trade => {
      const {
        amount0In,
        amount0Out,
        amount1In,
        amount1Out,
        transaction: { id },
        timestamp,
        amountUSD,
        logoKey,
      } = trade
      const normalizedValues = {
        amount0In: Number(amount0In),
        amount0Out: Number(amount0Out),
        amount1In: Number(amount1In),
        amount1Out: Number(amount1Out),
        token0Address: token0.address.toLowerCase(),
        token1Address: token1.address.toLowerCase(),
        inputTokenAddress: inputToken.address.toLowerCase(),
        outputTokenAddress: outputToken.address.toLowerCase(),
      }

      const amount0 = Math.max(normalizedValues.amount0In, normalizedValues.amount0Out)
      const amount1 = Math.max(normalizedValues.amount1In, normalizedValues.amount1Out)

      return {
        transactionId: id,
        amountIn: (normalizedValues.inputTokenAddress === normalizedValues.token0Address
          ? amount0
          : amount1
        ).toString(),
        amountOut: (normalizedValues.outputTokenAddress === normalizedValues.token0Address
          ? amount0
          : amount1
        ).toString(),
        priceToken0: (amount1 / amount0).toString(),
        priceToken1: (amount0 / amount1).toString(),
        timestamp,
        amountUSD,
        isSell:
          (normalizedValues.token0Address === normalizedValues.inputTokenAddress &&
            normalizedValues.amount0In > normalizedValues.amount1In) ||
          (normalizedValues.token1Address === normalizedValues.inputTokenAddress &&
            normalizedValues.amount1In > normalizedValues.amount0In),
        logoKey,
      }
    })
    return {
      baseAdapterTradeHistory,
      baseAdapterLiquidityHistory,
    }
  }
)

export const selectUniswapV3AllDataFromAdapters = createSelector(
  [selectAllUniswapV3CurrentPairs, (state: AppState) => state.advancedTradingView.pair],
  (uniswapV3Pair, { inputToken, outputToken }) => {
    if (!inputToken || !outputToken || !uniswapV3Pair)
      return {
        uniswapV3TradeHistory: [],
        uniswapV3LiquidityHistory: [],
      }

    const [token0, token1] = sortsBeforeTokens(inputToken, outputToken)

    const { burnsAndMints, swaps } = uniswapV3Pair

    const uniswapV3LiquidityHistory: AdvancedViewTransaction[] = burnsAndMints.map(trade => {
      const {
        transaction: { id },
        amount0,
        amount1,
        timestamp,
        logoKey,
      } = trade
      return {
        transactionId: id,
        amountIn: `${amount0} ${token0.symbol}`,
        amountOut: `${amount1} ${token1.symbol}`,
        timestamp,
        logoKey,
      }
    })

    const uniswapV3TradeHistory: Required<AdvancedViewTransaction>[] = swaps.map(trade => {
      const {
        amount0,
        amount1,
        transaction: { id },
        timestamp,
        amountUSD,
        logoKey,
      } = trade
      const normalizedValues = {
        amount0: Number(amount0),
        amount1: Number(amount1),
        token0Address: token0.address.toLowerCase(),
        token1Address: token1.address.toLowerCase(),
        inputTokenAddress: inputToken.address.toLowerCase(),
        outputTokenAddress: outputToken.address.toLowerCase(),
      }

      // UniswapV3 returns one amount negative
      const absoluteAmount0 = Math.abs(normalizedValues.amount0)
      const absoluteAmount1 = Math.abs(normalizedValues.amount1)
      const isSell = normalizedValues.amount0 < 0

      return {
        transactionId: id,
        amountIn: (isSell ? absoluteAmount0 : absoluteAmount1).toString(),
        amountOut: (isSell ? absoluteAmount1 : absoluteAmount0).toString(),
        priceToken0: (absoluteAmount1 / absoluteAmount0).toString(),
        priceToken1: (absoluteAmount0 / absoluteAmount1).toString(),
        timestamp,
        amountUSD,
        isSell,
        logoKey,
      }
    })

    return {
      uniswapV3TradeHistory,
      uniswapV3LiquidityHistory,
    }
  }
)