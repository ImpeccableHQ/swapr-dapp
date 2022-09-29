import { Token } from '@swapr/sdk'

import { ChevronDown } from 'react-feather'
import { useTranslation } from 'react-i18next'
import Skeleton from 'react-loading-skeleton'
import { Flex } from 'rebass'

import DoubleCurrencyLogo from '../../../../components/DoubleLogo'
import { PairSearchModal } from '../../../../components/SearchModal/PairSearchModal'
import { usePairDetails } from '../../../../services/AdvancedTradingView/usePairDetails.hook'
import {
  PairInfo,
  PairSymbols,
  PairTab,
  PairValue,
  PairValueChange,
  SwitchButton,
  SwitcherWrapper,
} from '../AdvancedSwapMode.styles'

interface PairDetailsProps {
  token0?: Token
  token1?: Token
  activeCurrencyOption?: Token
  handleSwitchCurrency: (option: Token) => void
}

export const PairDetails = ({ activeCurrencyOption, token0, token1, handleSwitchCurrency }: PairDetailsProps) => {
  const { t } = useTranslation('swap')

  const { activeCurrencyDetails, handleOpenModal, isLoading, isPairModalOpen, onDismiss, onPairSelect, volume24hUSD } =
    usePairDetails(token0, token1, activeCurrencyOption)

  if (!token0 || !token1 || !activeCurrencyOption) return null

  return (
    <>
      <Flex alignItems="center" justifyContent="space-between">
        <Flex alignItems="center">
          <DoubleCurrencyLogo size={25} currency0={token0} currency1={token1} />
          <PairSymbols>
            {token0.symbol}/{token1.symbol}
          </PairSymbols>
          <ChevronDown style={{ cursor: 'pointer' }} onClick={handleOpenModal} />
        </Flex>
        <Flex flexBasis="80%">
          <PairInfo>
            <PairValueChange size="16px" positive={true}>
              {isLoading ? <Skeleton width="100px" height="14px" /> : activeCurrencyDetails.relativePrice}
            </PairValueChange>
            <PairTab>{isLoading ? <Skeleton width="100px" height="14px" /> : activeCurrencyDetails.price}</PairTab>
          </PairInfo>
          <PairInfo>
            <PairTab>
              <Flex alignItems="center">
                <span>{t('advancedTradingView.Change24')}</span>
              </Flex>
            </PairTab>
            <PairValueChange positive={Boolean(activeCurrencyDetails.isIncome24h)}>
              {isLoading ? (
                <Skeleton width="100px" height="14px" />
              ) : (
                <>
                  {activeCurrencyDetails.priceChange24h} {!activeCurrencyDetails.isIncome24h && '-'}
                  {activeCurrencyDetails.percentPriceChange24h}%
                </>
              )}
            </PairValueChange>
          </PairInfo>
          <PairInfo>
            <PairTab>{t('advancedTradingView.High24')}</PairTab>
            <PairValue>1690</PairValue>
          </PairInfo>
          <PairInfo>
            <PairTab>{t('advancedTradingView.Low24')}</PairTab>
            <PairValue>1569</PairValue>
          </PairInfo>
          <PairInfo>
            <PairTab>{t('advancedTradingView.Volume24')}</PairTab>
            <PairValue>
              {isLoading ? <Skeleton width="100px" height="14px" /> : activeCurrencyDetails.volume24h}
            </PairValue>
          </PairInfo>
          <PairInfo>
            <PairTab>{t('advancedTradingView.Volume24')}</PairTab>
            <PairValue>{isLoading ? <Skeleton width="100px" height="14px" /> : volume24hUSD}</PairValue>
          </PairInfo>
        </Flex>
        <SwitcherWrapper>
          <SwitchButton
            onClick={() => handleSwitchCurrency(token0)}
            active={activeCurrencyOption.address === token0.address}
          >
            {token0.symbol?.substring(0, 4)}
          </SwitchButton>
          <SwitchButton
            onClick={() => handleSwitchCurrency(token1)}
            active={activeCurrencyOption.address === token1.address}
          >
            {token1.symbol?.substring(0, 4)}
          </SwitchButton>
        </SwitcherWrapper>
      </Flex>
      <PairSearchModal isOpen={isPairModalOpen} onDismiss={onDismiss} onPairSelect={onPairSelect} />
    </>
  )
}
