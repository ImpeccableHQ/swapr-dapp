import { currencies, CurrencySymbol } from '../constants'

export function renderCurrencyLogo(currencySymbol: CurrencySymbol) {
  const Logo = currencies[currencySymbol]

  return <Logo />
}
