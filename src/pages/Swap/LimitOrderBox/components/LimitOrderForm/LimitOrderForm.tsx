import { Web3Provider } from '@ethersproject/providers'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { ChainId, Currency, JSBI, Price, Token, TokenAmount } from '@swapr/sdk'

import dayjs from 'dayjs'
import dayjsUTCPlugin from 'dayjs/plugin/utc'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePrevious } from 'react-use'
import { Flex } from 'rebass'

import { ButtonPrimary } from '../../../../../components/Button'
import { AutoColumn } from '../../../../../components/Column'
import { CurrencyInputPanel } from '../../../../../components/CurrencyInputPanel'
import { PageMetaData } from '../../../../../components/PageMetaData'
import { ApprovalState, useApproveCallback } from '../../../../../hooks/useApproveCallback'
import { useHigherUSDValue } from '../../../../../hooks/useUSDValue'
import { useNotificationPopup } from '../../../../../state/application/hooks'
import { useCurrencyBalances } from '../../../../../state/wallet/hooks'
import { maxAmountSpend } from '../../../../../utils/maxAmountSpend'
import AppBody from '../../../../AppBody'
import { createCoWLimitOrder, getQuote, getVaultRelayerAddress } from '../../api/cow'
import { LimitOrderFormContext } from '../../contexts/LimitOrderFormContext'
import { LimitOrderKind, MarketPrices, OrderExpiresInUnit, SerializableLimitOrder } from '../../interfaces'
import { getInitialState } from '../../utils'
import { ApprovalFlow } from '../ApprovalFlow'
import ConfirmLimitOrderModal from '../ConfirmLimitOrderModal'
import { CurrencySelectTooltip } from '../CurrencySelectTooltip'
import { OrderExpiryField } from '../OrderExpiryField'
import { OrderLimitPriceField } from '../OrderLimitPriceField'
import SwapTokens from '../SwapTokens'
import { AutoRow, MaxAlert } from './styles'
import { checkMaxOrderAmount, formatMarketPrice, formatMaxValue, toFixedSix } from './utils'

dayjs.extend(dayjsUTCPlugin)

interface HandleCurrencyAmountChangeParams {
  currency: Currency
  amountWei: string
  amountFormatted: string
  updatedLimitOrder?: SerializableLimitOrder
}

export interface LimitOrderFormProps {
  provider: Web3Provider
  chainId: ChainId
  account: string
}

/**
 * The Limit Order Form is the base component for all limit order forms.
 */
export function LimitOrderForm({ account, provider, chainId }: LimitOrderFormProps) {
  const [loading, setLoading] = useState(false)
  const notify = useNotificationPopup()
  // Get the initial values and set the state
  let initialState = useRef(getInitialState(chainId, account)).current
  // Local state
  const [expiresInUnit, setExpiresInUnit] = useState(OrderExpiresInUnit.Minutes)
  // Default expiry time set to 20 minutes
  const [expiresIn, setExpiresIn] = useState(20)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  // IsPossibleToOrder
  const [isPossibleToOrder, setIsPossibleToOrder] = useState({
    status: false,
    value: 0,
  })

  // State holding the sell and buy currency amounts
  const [sellTokenAmount, setSellTokenAmount] = useState<TokenAmount>(initialState.sellTokenAmount)
  const [buyTokenAmount, setBuyTokenAmount] = useState<TokenAmount>(initialState.buyTokenAmount)

  // State holding the limit/order price
  const [price, setPrice] = useState<Price>(initialState.price)

  // Final limit order to be sent to the internal API
  const [limitOrder, setLimitOrder] = useState<SerializableLimitOrder>(initialState.limitOrder)

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    initialState = getInitialState(chainId, account)
    setSellTokenAmount(initialState.sellTokenAmount)
    setBuyTokenAmount(initialState.buyTokenAmount)
    setLimitOrder(initialState.limitOrder)
  }, [chainId])

  const [tokenInApproval, tokenInApprovalCallback] = useApproveCallback(
    sellTokenAmount,
    getVaultRelayerAddress(chainId)
  )
  const onModalDismiss = () => {
    setIsModalOpen(false)
    setErrorMessage('')
  }
  const setToMarket = async () => {
    const signer = provider.getSigner()
    if (!limitOrder.buyToken || !limitOrder.sellToken) {
      return
    }

    const order = JSON.parse(JSON.stringify(limitOrder))

    const token = limitOrder.kind === LimitOrderKind.SELL ? sellTokenAmount : buyTokenAmount

    const tokenAmount = Number(token.toExact()) > 1 ? token.toExact() : '1'

    order.sellAmount = parseUnits(tokenAmount, token.currency.decimals).toString()

    const cowQuote = await getQuote({
      chainId,
      signer,
      order: { ...order, expiresAt: dayjs().add(expiresIn, expiresInUnit).unix() },
    })

    if (cowQuote !== undefined) {
      const {
        quote: { buyAmount, sellAmount },
      } = cowQuote

      const nextLimitPriceFloat =
        limitOrder.kind === LimitOrderKind.SELL
          ? formatMarketPrice(buyAmount, buyTokenAmount.currency.decimals, tokenAmount)
          : formatMarketPrice(sellAmount, sellTokenAmount.currency.decimals, tokenAmount)

      const limitPrice = parseUnits(
        nextLimitPriceFloat.toFixed(6),
        limitOrder.kind === LimitOrderKind.SELL ? sellTokenAmount.currency.decimals : buyTokenAmount.currency.decimals
      ).toString()

      // get and parse the sell token amount
      const sellTokenAmountFloat = parseFloat(
        formatUnits(sellTokenAmount.raw.toString(), sellTokenAmount.currency.decimals)
      )

      let newBuyAmountAsFloat = 0 // the amount of buy token

      if (limitOrder.kind === LimitOrderKind.SELL) {
        newBuyAmountAsFloat = sellTokenAmountFloat * nextLimitPriceFloat
      } else {
        newBuyAmountAsFloat = sellTokenAmountFloat / nextLimitPriceFloat
      }

      const nextBuyAmountWei = parseUnits(
        newBuyAmountAsFloat.toFixed(6), // 6 is the lowest precision we support due to tokens like USDC
        buyTokenAmount?.currency?.decimals
      ).toString()

      const nextTokenBuyAmount = new TokenAmount(buyTokenAmount.currency as Token, nextBuyAmountWei)

      setBuyTokenAmount(nextTokenBuyAmount)
      setFormattedLimitPrice(toFixedSix(nextLimitPriceFloat))
      setFormattedBuyAmount(toFixedSix(newBuyAmountAsFloat))
      setLimitOrder({
        ...limitOrder,
        limitPrice: limitPrice,
        buyAmount: nextBuyAmountWei,
      })
    }
  }

  useEffect(() => {
    setToMarket().catch(e => {
      console.error(e)
      setIsPossibleToOrder({
        status: true,
        value: 0,
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyTokenAmount.currency, sellTokenAmount.currency])

  const [sellCurrencyBalance, buyCurrencyBalance] = useCurrencyBalances(account, [
    sellTokenAmount.currency,
    buyTokenAmount?.currency,
  ])

  // Fetch the maximum amount of tokens that can be bought or sold
  const sellCurrencyMaxAmount = maxAmountSpend(sellCurrencyBalance, chainId)
  const buyCurrencyMaxAmount = maxAmountSpend(buyCurrencyBalance, chainId, false)

  // Display formatted sell/buy amounts
  const [formattedSellAmount, setFormattedSellAmount] = useState<string>(
    parseFloat(formatUnits(initialState.limitOrder.sellAmount, initialState.sellTokenAmount.currency.decimals)).toFixed(
      6
    )
  )
  const [formattedBuyAmount, setFormattedBuyAmount] = useState<string>('0')
  // Display formatted sell/buy amounts
  const [formattedLimitPrice, setFormattedLimitPrice] = useState<string>('0')

  const { fiatValueInput, fiatValueOutput, isFallbackFiatValueInput, isFallbackFiatValueOutput } = useHigherUSDValue({
    inputCurrencyAmount: sellTokenAmount,
    outputCurrencyAmount: buyTokenAmount,
  })
  // Determine if the token has to be approved first
  const showApproveFlow = tokenInApproval === ApprovalState.NOT_APPROVED || tokenInApproval === ApprovalState.PENDING

  const handleSwapTokens = useCallback(() => {
    setSellTokenAmount(buyTokenAmount)
    setBuyTokenAmount(sellTokenAmount)
    setFormattedSellAmount(formattedBuyAmount)
    setFormattedBuyAmount(formattedSellAmount)
    setIsPossibleToOrder({ status: false, value: 0 })
    if (buyTokenAmount.currency.address && sellTokenAmount.currency.address) {
      setLimitOrder(limitOrder => ({
        ...limitOrder,
        sellAmount: buyTokenAmount.raw.toString(),
        buyAmount: sellTokenAmount.raw.toString(),
        sellToken: buyTokenAmount.currency.address!,
        buyToken: sellTokenAmount.currency.address!,
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyTokenAmount, sellTokenAmount])

  // Form submission handler
  const placeLimitOrder = async () => {
    setLoading(true)

    // sign the order
    try {
      const signer = provider.getSigner()

      const finalizedLimitOrder = {
        ...limitOrder,
        expiresAt: dayjs().add(expiresIn, expiresInUnit).unix(),
      }

      const response = await createCoWLimitOrder({
        chainId,
        signer,
        order: finalizedLimitOrder,
      })

      if (response) {
        notify(
          <>
            Successfully created limit order. Please check <Link to="/account">user account</Link> for details
          </>
        )
      } else {
        throw new Error(response)
      }
    } catch (error) {
      console.error(error)
      setErrorMessage('Failed to place limit order. Try again.')
      notify('Failed to place limit order. Try again.', false)
    } finally {
      setLoading(false)
    }
  }

  const previousSellAmount = usePrevious(sellCurrencyBalance)
  const newSellAmount = previousSellAmount?.raw.toString() !== sellCurrencyBalance?.raw.toString()

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const amountWei = parseUnits(
        parseFloat(formattedSellAmount).toFixed(6),
        sellTokenAmount?.currency?.decimals
      ).toString()
      const expiresAt = dayjs().add(expiresIn, expiresInUnit).unix()
      const sellCurrencyMaxAmount = maxAmountSpend(sellCurrencyBalance, chainId)

      checkMaxOrderAmount(
        limitOrder,
        setIsPossibleToOrder,
        setLimitOrder,
        amountWei,
        expiresAt,
        sellTokenAmount,
        sellCurrencyMaxAmount,
        chainId,
        provider
      )
    }, 500)
    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formattedSellAmount, formattedBuyAmount, newSellAmount])

  /**
   * Aggregate the sell currency amount state variables into a single value
   */
  const handleSellCurrencyAmountChange = ({
    amountWei,
    currency,
    amountFormatted,
    updatedLimitOrder = limitOrder,
  }: HandleCurrencyAmountChangeParams) => {
    const limitPriceFloat = parseFloat(formattedLimitPrice)
    // Construct a new token amount and format it
    const newLimitOrder = {
      ...updatedLimitOrder,
      sellAmount: amountWei,
      sellToken: currency.address as string,
    }
    // Update the buy currency amount if the user has selected a token
    // Update relevant state variables
    const nextSellTokenAmount = new TokenAmount(currency as Token, amountWei)
    const nextSellAmountFloat = parseFloat(amountFormatted)

    setFormattedSellAmount(amountFormatted) // update the token amount input

    let nextBuyAmountFloat = 0
    // Compute the buy amount based on the new sell amount

    if (limitOrder.kind === LimitOrderKind.SELL) {
      nextBuyAmountFloat = nextSellAmountFloat * limitPriceFloat
    } else {
      nextBuyAmountFloat = nextSellAmountFloat / limitPriceFloat
    }
    if (Number(amountWei ?? 0) === 0) {
      setIsPossibleToOrder({ value: 0, status: true })
    }

    // Format the buy amount
    // Update buy amount state variables
    setBuyTokenAmount(
      new TokenAmount(
        buyTokenAmount.currency as Token,
        parseUnits(nextBuyAmountFloat.toFixed(6), buyTokenAmount.currency.decimals).toString()
      )
    )
    setFormattedBuyAmount(toFixedSix(nextBuyAmountFloat)) // update the token amount input
    setSellTokenAmount(nextSellTokenAmount)
    // Re-compute the limit order buy
    setLimitOrder(newLimitOrder)
  }

  /**
   * Aggregate the buy currency amount state variables into a single value
   */
  const handleBuyCurrencyAmountChange = ({
    amountWei,
    currency,
    amountFormatted,
    updatedLimitOrder = limitOrder,
  }: HandleCurrencyAmountChangeParams) => {
    // Construct a new token amount and format it
    const limitPriceFloat = parseFloat(formattedLimitPrice)

    const newLimitOrder = {
      ...updatedLimitOrder,
      buyAmount: amountWei,
      buyToken: currency.address as string,
    }

    const newBuyTokenAmount = new TokenAmount(currency as Token, amountWei)
    const nextBuyAmountFloat = parseFloat(amountFormatted)

    // Update relevant state variables
    setBuyTokenAmount(newBuyTokenAmount)

    let nextSellAmountFloat = 0
    // Compute sell buy amount based on the new sell amount

    if (limitOrder.kind === LimitOrderKind.SELL) {
      nextSellAmountFloat = nextBuyAmountFloat / limitPriceFloat
    } else {
      nextSellAmountFloat = nextBuyAmountFloat * limitPriceFloat
    }
    if (Number(amountWei ?? 0) === 0) {
      setIsPossibleToOrder({ value: 0, status: true })
    }

    // Format the sell amount
    // Update sell amount state variables
    setSellTokenAmount(
      new TokenAmount(
        sellTokenAmount.currency as Token,
        parseUnits(nextSellAmountFloat.toFixed(6), sellTokenAmount.currency.decimals).toString()
      )
    )
    setFormattedSellAmount(toFixedSix(nextSellAmountFloat)) // update the token amount input
    setBuyTokenAmount(newBuyTokenAmount)
    // Re-compute the limit order buy
    setLimitOrder(newLimitOrder)
  }

  const handleInputOnChange = (token: Token, handleAmountChange: Function) => (formattedValue: string) => {
    const amountFormatted = formattedValue.trim() === '' ? '0' : formattedValue
    const amountWei = parseUnits(formattedValue, token.decimals).toString()
    handleAmountChange({
      currency: token as Token,
      amountWei,
      amountFormatted,
    })
  }

  const handleCurrencySelect =
    (prevTokenAmount: TokenAmount, handleCurrencyAmountChange: Function, amountFormatted: string) =>
    (currency: Currency) => {
      let amountWei
      if (amountFormatted) amountWei = parseUnits(amountFormatted, currency?.decimals).toString()
      else if (prevTokenAmount?.raw) {
        const newAmount = JSBI.divide(
          JSBI.BigInt(prevTokenAmount.raw.toString()),
          JSBI.BigInt(10 ** prevTokenAmount?.currency?.decimals)
        ).toString()
        amountWei = parseUnits(newAmount, currency?.decimals).toString()
      } else amountWei = '0' // use 0 if no buy currency amount is set

      handleCurrencyAmountChange({ currency, amountWei, amountFormatted })
    }

  const [marketPrices, setMarketPrices] = useState<MarketPrices>({ buy: 0, sell: 0 })

  const getMarketPrices = useCallback(async () => {
    const signer = provider.getSigner()
    if (limitOrder.buyToken && limitOrder.sellToken) {
      const order = JSON.parse(JSON.stringify(limitOrder))

      const token = limitOrder.kind === LimitOrderKind.SELL ? sellTokenAmount : buyTokenAmount

      const tokenAmount = Number(token.toExact()) > 1 ? token.toExact() : '1'

      order.sellAmount = parseUnits(tokenAmount, token.currency.decimals).toString()

      const cowQuote = await getQuote({
        chainId,
        signer,
        order: { ...order, expiresAt: dayjs().add(expiresIn, expiresInUnit).unix() },
      })

      if (cowQuote) {
        const {
          quote: { buyAmount, sellAmount },
        } = cowQuote

        if (limitOrder.kind === LimitOrderKind.SELL) {
          setMarketPrices(marketPrice => ({
            ...marketPrice,
            buy: formatMarketPrice(buyAmount, buyTokenAmount.currency.decimals, tokenAmount),
          }))
        } else {
          setMarketPrices(marketPrice => ({
            ...marketPrice,
            sell: formatMarketPrice(sellAmount, sellTokenAmount.currency.decimals, tokenAmount),
          }))
        }
      }
    }
  }, [buyTokenAmount, chainId, expiresIn, expiresInUnit, limitOrder, provider, sellTokenAmount])

  useEffect(() => {
    getMarketPrices()
  }, [limitOrder.kind, getMarketPrices])

  useEffect(() => {
    setMarketPrices({ buy: 0, sell: 0 })
  }, [limitOrder.sellToken, limitOrder.buyToken])

  return (
    <>
      <PageMetaData title="Limit | Swapr" />
      <AppBody>
        <LimitOrderFormContext.Provider
          value={{
            limitOrder,
            setLimitOrder,
            price,
            setPrice,
            buyTokenAmount,
            setBuyTokenAmount,
            sellTokenAmount,
            setSellTokenAmount,
            formattedLimitPrice,
            setFormattedLimitPrice,
            formattedBuyAmount,
            setFormattedBuyAmount,
            expiresIn,
            setExpiresIn,
            expiresInUnit,
            setExpiresInUnit,
            setToMarket,
            marketPrices,
          }}
        >
          <ConfirmLimitOrderModal
            onConfirm={placeLimitOrder}
            onDismiss={onModalDismiss}
            isOpen={isModalOpen}
            errorMessage={errorMessage}
            attemptingTxn={loading}
            fiatValueInput={fiatValueInput}
            fiatValueOutput={fiatValueOutput}
          />
          <AutoColumn gap="12px">
            <AutoColumn gap="3px">
              <CurrencyInputPanel
                id="limit-order-box-sell-currency"
                currency={sellTokenAmount.currency}
                onCurrencySelect={handleCurrencySelect(
                  sellTokenAmount,
                  handleSellCurrencyAmountChange,
                  formattedSellAmount
                )}
                value={formattedSellAmount}
                onUserInput={handleInputOnChange(sellTokenAmount.currency as Token, handleSellCurrencyAmountChange)}
                onMax={() => {
                  if (!sellCurrencyMaxAmount) return
                  handleSellCurrencyAmountChange({
                    currency: sellCurrencyMaxAmount?.currency as Token,
                    amountWei: sellCurrencyMaxAmount?.raw.toString(),
                    amountFormatted: sellCurrencyMaxAmount.toSignificant(6),
                  })
                }}
                maxAmount={sellCurrencyMaxAmount}
                fiatValue={fiatValueInput}
                isFallbackFiatValue={isFallbackFiatValueInput}
                showNativeCurrency={false}
                currencyOmitList={[buyTokenAmount.currency.address!]}
                currencySelectWrapper={CurrencySelectTooltip}
              />
              <SwapTokens swapTokens={handleSwapTokens} loading={loading} />
              <CurrencyInputPanel
                id="limit-order-box-buy-currency"
                currency={buyTokenAmount?.currency}
                onCurrencySelect={handleCurrencySelect(
                  buyTokenAmount,
                  handleBuyCurrencyAmountChange,
                  formattedBuyAmount
                )}
                value={formattedBuyAmount}
                onUserInput={handleInputOnChange(buyTokenAmount.currency as Token, handleBuyCurrencyAmountChange)}
                maxAmount={buyCurrencyMaxAmount}
                fiatValue={fiatValueOutput}
                isFallbackFiatValue={isFallbackFiatValueOutput}
                showNativeCurrency={false}
                currencyOmitList={[sellTokenAmount.currency.address!]}
                currencySelectWrapper={CurrencySelectTooltip}
              />
            </AutoColumn>
            <AutoRow justify="space-between" flexWrap="nowrap" gap="12">
              <Flex flex={60}>
                <OrderLimitPriceField id="limitPrice" />
              </Flex>
              <Flex flex={40}>
                <OrderExpiryField id="limitOrderExpiry" />
              </Flex>
            </AutoRow>
            {showApproveFlow ? (
              <ApprovalFlow
                tokenInSymbol={sellTokenAmount.currency.symbol as string}
                approval={tokenInApproval}
                approveCallback={tokenInApprovalCallback}
              />
            ) : (
              <>
                {isPossibleToOrder.status && isPossibleToOrder.value > 0 && (
                  <MaxAlert>
                    Max possible amount with fees for {sellTokenAmount.currency.symbol} is{' '}
                    {formatMaxValue(isPossibleToOrder.value)}
                  </MaxAlert>
                )}
                <ButtonPrimary onClick={() => setIsModalOpen(true)} disabled={isPossibleToOrder.status}>
                  Place Limit Order
                </ButtonPrimary>
              </>
            )}
          </AutoColumn>
        </LimitOrderFormContext.Provider>
      </AppBody>
    </>
  )
}
