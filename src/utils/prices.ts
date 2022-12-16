import { parseUnits } from '@ethersproject/units'
import {
  _100,
  _10000,
  CoWTrade,
  Currency,
  CurrencyAmount,
  CurveTrade,
  Fraction,
  JSBI,
  Pair,
  Percent,
  Price,
  TokenAmount,
  Trade,
  UniswapTrade,
  UniswapV2Trade,
  ZERO,
  ZeroXTrade,
} from '@swapr/sdk'

import _Decimal from 'decimal.js-light'
import toFormat from 'toformat'

import {
  ALLOWED_FIAT_PRICE_IMPACT_HIGH,
  ALLOWED_PRICE_IMPACT_HIGH,
  ALLOWED_PRICE_IMPACT_LOW,
  ALLOWED_PRICE_IMPACT_MEDIUM,
  BLOCKED_PRICE_IMPACT_NON_EXPERT,
  NO_PRICE_IMPACT,
  PRICE_IMPACT_HIGH,
  PRICE_IMPACT_LOW,
  PRICE_IMPACT_MEDIUM,
  PRICE_IMPACT_NON_EXPERT,
  PriceImpact,
} from '../constants'
import { tryParseAmount } from '../state/swap/hooks'
import { Field } from '../state/swap/types'
import { wrappedCurrency, wrappedCurrencyAmount } from './wrappedCurrency'

const Decimal = toFormat(_Decimal)

const ONE_HUNDRED_PERCENT = new Percent(_10000, _10000)

interface TradePriceBreakdown {
  priceImpactWithoutFee?: Percent
  realizedLPFee?: Percent
  realizedLPFeeAmount?: CurrencyAmount
}

// computes price breakdown for the trade
export function computeTradePriceBreakdown(trade?: Trade): TradePriceBreakdown {
  // early exit
  if (!trade) {
    return {}
  }

  // for each hop in our trade, take away the x*y=k price impact from 0.3% fees
  // e.g. for 3 tokens/2 hops: 1 - ((1 - .03) * (1-.03))
  const realizedLPFee: Percent | undefined = computeRealizedLPFee(trade)

  function computeRealizedLPFee(trade: Trade) {
    if (trade instanceof UniswapV2Trade) {
      const totalRoutesFee = trade.route.pairs.reduce<Fraction>(
        (currentFee: Fraction, currentIndex: Pair): Fraction => {
          return currentFee.multiply(
            ONE_HUNDRED_PERCENT.subtract(new Percent(JSBI.BigInt(currentIndex.swapFee.toString()), _10000))
          )
        },
        ONE_HUNDRED_PERCENT
      )
      return ONE_HUNDRED_PERCENT.subtract(totalRoutesFee)
    } else if (trade instanceof CoWTrade || trade instanceof UniswapTrade || trade instanceof ZeroXTrade) {
      return trade.fee
    } else if (trade instanceof CurveTrade) {
      return ONE_HUNDRED_PERCENT.subtract(ONE_HUNDRED_PERCENT.subtract(trade.fee))
    } else return undefined
  }
  // remove lp fees from price impact
  const priceImpactWithoutFeeFraction = trade && realizedLPFee ? trade.priceImpact.subtract(realizedLPFee) : undefined

  // the x*y=k impact
  const priceImpactWithoutFeePercent = priceImpactWithoutFeeFraction
    ? new Percent(priceImpactWithoutFeeFraction?.numerator, priceImpactWithoutFeeFraction?.denominator)
    : undefined

  function computeRealizedLPFeeAmount(trade: Trade, realizedLPFee?: Fraction) {
    if (!realizedLPFee) return undefined

    if (trade instanceof CoWTrade) return (trade as CoWTrade).feeAmount
    else if (trade.inputAmount instanceof TokenAmount)
      return new TokenAmount(trade.inputAmount.token, realizedLPFee.multiply(trade.inputAmount.raw).quotient)
    else return CurrencyAmount.nativeCurrency(realizedLPFee.multiply(trade.inputAmount.raw).quotient, trade.chainId)
  }
  const realizedLPFeeAmount = computeRealizedLPFeeAmount(trade, realizedLPFee)

  return {
    priceImpactWithoutFee: priceImpactWithoutFeePercent,
    realizedLPFee: realizedLPFee ? new Percent(realizedLPFee.numerator, realizedLPFee.denominator) : undefined,
    realizedLPFeeAmount,
  }
}

// calculates teh protocol fee for a pair and amount
export function calculateProtocolFee(
  pair: Pair | null | undefined,
  amount?: CurrencyAmount,
  chainId?: number
): { protocolFee?: Fraction; protocolFeeAmount?: CurrencyAmount } {
  const protocolFee = pair ? new Percent(pair.swapFee, _100).divide(pair.protocolFeeDenominator) : undefined

  // the amount of the input that accrues to LPs
  const protocolFeeAmount =
    protocolFee && amount && chainId
      ? amount instanceof TokenAmount
        ? new TokenAmount(amount.token, protocolFee.multiply(amount.raw).divide(_10000).quotient)
        : CurrencyAmount.nativeCurrency(protocolFee.multiply(amount.raw).divide(_10000).quotient, chainId)
      : undefined

  return { protocolFee, protocolFeeAmount }
}

// computes the minimum amount out and maximum amount in for a trade given a user specified allowed slippage in bips
export function computeSlippageAdjustedAmounts(trade: Trade | undefined): { [field in Field]?: CurrencyAmount } {
  return {
    [Field.INPUT]: trade?.maximumAmountIn(),
    [Field.OUTPUT]: trade?.minimumAmountOut(),
  }
}

const ALLOWED_PRICE_IMPACT_PERCENTAGE: { [key: number]: Percent } = {
  [PRICE_IMPACT_NON_EXPERT]: BLOCKED_PRICE_IMPACT_NON_EXPERT,
  [PRICE_IMPACT_HIGH]: ALLOWED_PRICE_IMPACT_HIGH,
  [PRICE_IMPACT_MEDIUM]: ALLOWED_PRICE_IMPACT_MEDIUM,
  [PRICE_IMPACT_LOW]: ALLOWED_PRICE_IMPACT_LOW,
}

const ALLOWED_FIAT_PRICE_IMPACT_PERCENTAGE: { [key: number]: Percent } = {
  [PRICE_IMPACT_HIGH]: ALLOWED_FIAT_PRICE_IMPACT_HIGH,
}

export function warningSeverity(priceImpact: Percent | undefined): 0 | 1 | 2 | 3 | 4 {
  if (!priceImpact?.lessThan(ALLOWED_PRICE_IMPACT_PERCENTAGE[PRICE_IMPACT_NON_EXPERT])) return PRICE_IMPACT_NON_EXPERT
  if (!priceImpact?.lessThan(ALLOWED_PRICE_IMPACT_PERCENTAGE[PRICE_IMPACT_HIGH])) return PRICE_IMPACT_HIGH
  if (!priceImpact?.lessThan(ALLOWED_PRICE_IMPACT_PERCENTAGE[PRICE_IMPACT_MEDIUM])) return PRICE_IMPACT_MEDIUM
  if (!priceImpact?.lessThan(ALLOWED_PRICE_IMPACT_PERCENTAGE[PRICE_IMPACT_LOW])) return PRICE_IMPACT_LOW
  return NO_PRICE_IMPACT
}

export function warningSeverityZap(
  priceImpactTrade0: Percent | undefined,
  priceImpactTrade1: Percent | undefined
): PriceImpact {
  const severityTrade0 = warningSeverity(priceImpactTrade0)
  const severityTrade1 = warningSeverity(priceImpactTrade1)
  if (severityTrade0 === 4 || severityTrade1 === 4) return PriceImpact.ONLY_EXPERT
  if (severityTrade0 === 3 || severityTrade1 === 3) return PriceImpact.HIGH
  if (severityTrade0 === 2 || severityTrade1 === 2) return PriceImpact.MEDIUM
  if (severityTrade0 === 1 || severityTrade1 === 1) return PriceImpact.LOW
  return PriceImpact.NO_IMPACT
}

export function simpleWarningSeverity(priceImpact: Percent | undefined): 0 | 3 {
  if (!priceImpact?.lessThan(ALLOWED_FIAT_PRICE_IMPACT_PERCENTAGE[PRICE_IMPACT_HIGH])) return PRICE_IMPACT_HIGH
  return NO_PRICE_IMPACT
}

export function formatExecutionPrice(trade?: Trade, inverted?: boolean): string {
  if (!trade) {
    return ''
  }
  return inverted
    ? `${trade.executionPrice.invert().toSignificant(6)} ${trade.inputAmount.currency.symbol} / ${
        trade.outputAmount.currency.symbol
      }`
    : `${trade.executionPrice.toSignificant(6)} ${trade.outputAmount.currency.symbol} / ${
        trade.inputAmount.currency.symbol
      }`
}

export function sortTradesByExecutionPrice(trades: (Trade | undefined)[]): (Trade | undefined)[] {
  return trades.sort((a, b) => {
    if (a === undefined || a === null) {
      return 1
    }
    if (b === undefined || b === null) {
      return -1
    }

    if (a.executionPrice.lessThan(b.executionPrice)) {
      return 1
    } else if (a.executionPrice.equalTo(b.executionPrice)) {
      return 0
    } else {
      return -1
    }
  })
}

export function getLpTokenPrice(
  pair: Pair,
  nativeCurrency: Currency,
  totalSupply: string,
  reserveNativeCurrency: string
): Price {
  const decimalTotalSupply = new Decimal(totalSupply)
  // the following check avoids division by zero when total supply is zero
  // (case in which a pair has been created but liquidity has never been proviided)
  const priceDenominator = decimalTotalSupply.isZero()
    ? '1'
    : parseUnits(
        new Decimal(totalSupply).toFixed(pair.liquidityToken.decimals),
        pair.liquidityToken.decimals
      ).toString()
  return new Price({
    baseCurrency: pair.liquidityToken,
    quoteCurrency: nativeCurrency,
    denominator: priceDenominator,
    numerator: parseUnits(
      new Decimal(reserveNativeCurrency).toFixed(nativeCurrency.decimals),
      nativeCurrency.decimals
    ).toString(),
  })
}

/**
 * Returns trimmed fraction value to limit number of decimal places
 * @param value Fraction value to trim
 * @param significantDigits Limit number of decimal places
 * @param rounding Rounding mode
 */
export const limitNumberOfDecimalPlaces = (
  value?: CurrencyAmount | Fraction,
  significantDigits = 6,
  format = { groupSeparator: '' },
  rounding = Decimal.ROUND_DOWN
): string | undefined => {
  if (!value || value.equalTo(ZERO)) return undefined
  if (value instanceof CurrencyAmount && value.currency.decimals < significantDigits)
    significantDigits =
      typeof value.currency.decimals === 'string' ? parseInt(value.currency.decimals) : value.currency.decimals

  const fixedQuotient = value.toFixed(significantDigits)
  Decimal.set({ precision: significantDigits + 1, rounding })
  const quotient = new Decimal(fixedQuotient).toSignificantDigits(6)

  return quotient.toFormat(quotient.decimalPlaces(), format)
}

export interface ZapInAmountsResults {
  amountFromForTokenA?: CurrencyAmount
  amountFromForTokenB?: CurrencyAmount
  amountAddLpTokenA?: CurrencyAmount
  amountAddLpTokenB?: CurrencyAmount
  estLpTokenMinted?: TokenAmount
}

/**
 * Returns estimated tokens amounts used for zap in
 */
export const calculateZapInAmounts = (
  amountFrom: CurrencyAmount | undefined,
  pair: Pair | undefined,
  pairTotalSupply: TokenAmount | undefined,
  priceToken0TokenFrom: Price | undefined,
  priceToken1TokenFrom: Price | undefined,
  chainId: number | undefined
): ZapInAmountsResults => {
  if (!amountFrom || !pair || !pairTotalSupply || !priceToken0TokenFrom || !priceToken1TokenFrom || !chainId)
    return {
      amountAddLpTokenA: undefined,
      amountAddLpTokenB: undefined,
      amountFromForTokenA: undefined,
      amountFromForTokenB: undefined,
      estLpTokenMinted: undefined,
    }
  // determine significant digits
  const significantDigits = amountFrom.currency.decimals

  // convert amounts to number for calculations
  const pairPrice = Number(pair.token1Price.toFixed(significantDigits))
  const token0TokenFromPrice = Number(priceToken0TokenFrom.toFixed(significantDigits))
  const token1TokenFromPrice = Number(priceToken1TokenFrom.toFixed(significantDigits))
  const amountFromBN = Number(amountFrom.toFixed(significantDigits))

  // calculate liquidity pool's tokens amounts which will be added to the LP
  const rawLpAmountB = Number(
    (amountFromBN / (pairPrice * token0TokenFromPrice + token1TokenFromPrice)).toFixed(significantDigits)
  )
  const rawLpAmountA = Number((rawLpAmountB * pairPrice).toFixed(significantDigits))

  // calculate fromToken amount which should be used to buy pool's tokens accordingly
  const rawFromForB = rawLpAmountB * token1TokenFromPrice
  const rawFromForA = amountFromBN - rawFromForB

  // amounts of input token which should be used to buy tokenA and tokenB
  // amountFrom = amountFromForTokenA + amountFromForTokenB
  const amountFromForTokenA = tryParseAmount(rawFromForA.toFixed(significantDigits), amountFrom.currency, chainId)
  const amountFromForTokenB = tryParseAmount(rawFromForB.toFixed(significantDigits), amountFrom.currency, chainId)

  // amounts of tokenA and tokenB which should be used to add liquidity accordingly
  const amountAddLpTokenA = tryParseAmount(rawLpAmountA.toFixed(significantDigits), pair.token0, chainId)
  const amountAddLpTokenB = tryParseAmount(rawLpAmountB.toFixed(significantDigits), pair.token1, chainId)

  const [tokenAmountA, tokenAmountB] = [
    wrappedCurrencyAmount(amountAddLpTokenA, chainId),
    wrappedCurrencyAmount(amountAddLpTokenB, chainId),
  ]
  // estimated amount of LP tokens received after zap in
  const estLpTokenMinted =
    tokenAmountA && tokenAmountB && tokenAmountA.greaterThan('0') && tokenAmountB.greaterThan('0')
      ? pair.getLiquidityMinted(pairTotalSupply, tokenAmountA, tokenAmountB)
      : undefined

  return { amountAddLpTokenA, amountAddLpTokenB, amountFromForTokenA, amountFromForTokenB, estLpTokenMinted }
}

export interface ZapOutAmountsResults {
  estAmountTokenTo: TokenAmount | undefined
}

/**
 * Returns estimated tokens amounts used for zap out
 */
export const calculateZapOutAmounts = (
  amountFrom: CurrencyAmount | undefined,
  pair: Pair | undefined,
  pairTotalSupply: TokenAmount | undefined,
  userLiquidity: TokenAmount | undefined,
  priceToken0TokenTo: Price | undefined,
  priceToken1TokenTo: Price | undefined,
  chainId: number | undefined
): ZapOutAmountsResults => {
  if (
    !amountFrom ||
    !pair ||
    !pairTotalSupply ||
    !userLiquidity ||
    !priceToken0TokenTo ||
    !priceToken1TokenTo ||
    !chainId
  )
    return {
      estAmountTokenTo: undefined,
    }
  // determine significant digits in case currency has less than 9 decimals
  const tokenTo = wrappedCurrency(priceToken0TokenTo.quoteCurrency, chainId)
  // use token amount for output calculation (if user has no LP use parsed amount)
  const lpTokenAmount = userLiquidity.greaterThan('0') ? userLiquidity : wrappedCurrencyAmount(amountFrom, chainId)

  const [tokenA, tokenB] = [pair?.token0, pair?.token1]
  // liquidity values of each token
  const pooledAmountTokenA =
    pair && pairTotalSupply && lpTokenAmount && tokenA
      ? new TokenAmount(tokenA, pair.getLiquidityValue(tokenA, pairTotalSupply, lpTokenAmount, false).raw)
      : undefined
  const pooledAmountTokenB =
    pair && pairTotalSupply && lpTokenAmount && tokenB
      ? new TokenAmount(tokenB, pair.getLiquidityValue(tokenB, pairTotalSupply, lpTokenAmount, false).raw)
      : undefined

  let percentToRemove: Percent = new Percent('0', '100')
  if (pair?.liquidityToken && amountFrom && lpTokenAmount) {
    percentToRemove = new Percent(amountFrom.raw, lpTokenAmount.raw)
  }

  // calculate liquidity pool's tokens amounts which will be removed from the LP and
  // then output token amount which will be swapped for LP's tokens
  const amountTokenToLpTokenA = pooledAmountTokenA
    ? percentToRemove.multiply(pooledAmountTokenA.raw).multiply(priceToken0TokenTo)
    : undefined
  const amountTokenToLpTokenB = pooledAmountTokenB
    ? percentToRemove.multiply(pooledAmountTokenB.raw).multiply(priceToken1TokenTo)
    : undefined

  // estimate total amount of output token
  const estAmountTokenTo =
    tokenTo && amountTokenToLpTokenA?.greaterThan('0') && amountTokenToLpTokenB?.greaterThan('0')
      ? new TokenAmount(tokenTo, amountTokenToLpTokenA.add(amountTokenToLpTokenB).quotient)
      : undefined

  return { estAmountTokenTo }
}
