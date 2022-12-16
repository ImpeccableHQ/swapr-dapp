import { useTranslation } from 'react-i18next'

import { CurrencyLogo } from '../CurrencyLogo'
import { DoubleCurrencyLogo } from '../DoubleCurrencyLogo'
import { StyledDropDown, StyledTokenName } from './CurrencyInputPanel.styles'
import { CurrencyViewProps, InputType } from './CurrencyInputPanel.types'

export const CurrencyView = ({
  pair,
  currency,
  chainIdOverride,
  currencyWrapperSource,
  disableCurrencySelect,
  inputType,
}: CurrencyViewProps) => {
  const { t } = useTranslation('swap')

  if (pair && (currency?.symbol === 'DXS' || !currency)) {
    return (
      <>
        <DoubleCurrencyLogo marginRight={4} currency0={pair.token0} currency1={pair.token1} size={20} />
        <StyledTokenName className="pair-name-container">
          {pair?.token0.symbol}/{pair?.token1.symbol}
        </StyledTokenName>
        {!disableCurrencySelect && (pair || currency) && <StyledDropDown selected={!!currency} />}
      </>
    )
  }

  return (
    <>
      {currency && (
        <CurrencyLogo
          size="20px"
          currency={currency}
          chainIdOverride={chainIdOverride}
          currencyWrapperSource={currencyWrapperSource}
        />
      )}
      <StyledTokenName
        className="token-symbol-container"
        data-testid="token-symbol"
        active={Boolean(currency && currency.symbol)}
      >
        {(currency && currency.symbol && currency.symbol.length > 20
          ? currency.symbol.slice(0, 4) +
            '...' +
            currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
          : currency?.symbol) || (
          <div data-testid="select-token-button">
            {' '}
            {inputType === InputType.currency ? t('button.selectToken') : t('button.selectPair')}
          </div>
        )}
      </StyledTokenName>
      {!disableCurrencySelect && (pair || currency) && <StyledDropDown selected={!!currency} />}
    </>
  )
}
