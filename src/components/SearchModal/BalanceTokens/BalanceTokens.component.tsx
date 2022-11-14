import { Currency, Token } from '@swapr/sdk'

import { useMemo } from 'react'
import { Text } from 'rebass'

import { useActiveWeb3React } from '../../../hooks'
import { useNativeCurrency } from '../../../hooks/useNativeCurrency'
import { useCurrencyBalances } from '../../../state/wallet/hooks'
import { TYPE } from '../../../theme'
import { AutoColumn } from '../../Column'
import { CurrencyLogo } from '../../CurrencyLogo'
import { Loader } from '../../Loader'
import Row from '../../Row'
import { BaseWrapper } from '../shared'
import { BalanceTokensProps } from './BalanceTokens.types'

export const BalanceTokens = ({
  onCurrencySelect,
  selectedCurrency,
  filteredSortedTokensWithNativeCurrency,
  limit = 5,
}: BalanceTokensProps) => {
  const nativeCurrency = useNativeCurrency()
  const { account } = useActiveWeb3React()
  const balances = useCurrencyBalances(account || undefined, filteredSortedTokensWithNativeCurrency)

  const sortedTokensWithBalance = useMemo(() => {
    let sortedTokensWithBalance: { currency: Currency; balance?: string }[] = []

    for (const [index, balance] of balances.entries()) {
      if (balance && balance.equalTo(BigInt(0))) {
        break
      }
      sortedTokensWithBalance.push({
        currency: filteredSortedTokensWithNativeCurrency[index],
        balance: balance?.toSignificant(4),
      })
    }

    return sortedTokensWithBalance
  }, [balances, filteredSortedTokensWithNativeCurrency])

  const limitedTokensWithBalance = sortedTokensWithBalance.splice(0, limit)
  const restTokensWithBalanceLength = sortedTokensWithBalance.length

  if (limitedTokensWithBalance.length === 0) {
    return null
  }

  return (
    <AutoColumn gap="15px" data-testid="balance-tokens" style={{ marginTop: '44px' }}>
      <Row justifyContent="center">
        <TYPE.Body fontWeight={700} fontSize="11px" lineHeight="13px" letterSpacing="0.06em" color={'#C0BAF6'}>
          YOUR BALANCE
        </TYPE.Body>
      </Row>
      <Row justifyContent="center" flexWrap={'wrap'} gap={'8px'}>
        {limitedTokensWithBalance.map(({ balance, currency }, index) => {
          const selected = selectedCurrency instanceof Token && selectedCurrency.address === currency.address
          const selectedNativeCurrency = selectedCurrency === nativeCurrency || selectedCurrency === undefined

          return (
            <BaseWrapper
              onClick={() =>
                index ? !selected && onCurrencySelect(currency) : !selectedNativeCurrency && onCurrencySelect(currency)
              }
              disabled={index ? selected : selectedNativeCurrency}
              key={currency.address}
            >
              <CurrencyLogo size="20px" currency={currency} marginRight={8} />
              {balance ? (
                <Text fontWeight={500} fontSize={16}>
                  {balance}
                </Text>
              ) : (
                <Loader />
              )}
              <Text fontWeight={500} fontSize={16} pl={'4px'}>
                {` ${currency.symbol}`}
              </Text>
            </BaseWrapper>
          )
        })}
        {restTokensWithBalanceLength > 0 && (
          <BaseWrapper onClick={() => console.log('handler needed')}>
            <Text fontWeight={500} fontSize={16}>
              {`+${restTokensWithBalanceLength}`}
            </Text>
          </BaseWrapper>
        )}
      </Row>
    </AutoColumn>
  )
}
