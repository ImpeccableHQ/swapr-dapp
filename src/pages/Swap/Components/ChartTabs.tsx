import { useTranslation } from 'react-i18next'
import { Flex } from 'rebass'
import styled from 'styled-components'

import { MouseoverTooltip } from '../../../components/Tooltip'
import { useIsDesktop } from '../../../hooks/useIsDesktopByMedia'
import { useRouter } from '../../../hooks/useRouter'
import { useUpdateSelectedChartOption } from '../../../state/user/hooks'
import { ChartOption } from '../../../state/user/reducer'

export const ChartTabs = ({
  activeChartTab,
  setActiveChartTab,
}: {
  activeChartTab: ChartOption
  setActiveChartTab: (tab: ChartOption) => void
}) => {
  const { navigate } = useRouter()
  const { t } = useTranslation('swap')
  const isDesktop = useIsDesktop()
  const [, setSelectedChartTab] = useUpdateSelectedChartOption()

  return (
    <MouseoverTooltip placement="top" disabled={isDesktop} content="Available only on desktop">
      <Root>
        {/* <Tab
        active={activeChartTab === ChartOptions.SIMPLE_CHART}
        onClick={() => {
          if (activeChartTab !== ChartOptions.SIMPLE_CHART) {
            setActiveChartTab(ChartOptions.SIMPLE_CHART)
            navigate('/swap')
          }
        }}
        title={t('advancedTradingView.chartTabs.simpleTitle')}
        disabled={!hasBothCurrenciesInput}
      >
        {t('advancedTradingView.chartTabs.simple')}
      </Tab> */}
        <Tab
          active={activeChartTab === ChartOption.PRO}
          onClick={() => {
            if (activeChartTab !== ChartOption.PRO) {
              setActiveChartTab(ChartOption.PRO)
              setSelectedChartTab(ChartOption.PRO)
              navigate('/swap/pro')
              window?.fathom?.trackPageview()
            }
          }}
          title={
            // proOptionsDisabled
            //   ? t('advancedTradingView.chartTabs.proDisabledTitle'):
            t('advancedTradingView.chartTabs.proTitle')
          }
          disabled={!isDesktop}
        >
          {t('advancedTradingView.chartTabs.pro')}
        </Tab>
        <Tab
          active={activeChartTab === ChartOption.OFF}
          onClick={() => {
            if (activeChartTab !== ChartOption.OFF) {
              setActiveChartTab(ChartOption.OFF)
              setSelectedChartTab(ChartOption.OFF)
              navigate('/swap')
              window?.fathom?.trackPageview()
            }
          }}
          title={t('advancedTradingView.chartTabs.offTitle')}
          disabled={!isDesktop}
        >
          {t('advancedTradingView.chartTabs.off')}
        </Tab>
      </Root>
    </MouseoverTooltip>
  )
}

const Root = styled(Flex)`
  background: ${({ theme }) => theme.dark1};
  border-radius: 12px;
  padding: 3px;
  > * {
    margin-right: 3px;
  }
`

export const Tab = styled.button<{ active?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  height: fit-content;
  padding: 8px;
  background: ${({ active, theme }) => (active ? theme.dark2 : theme.dark1)};
  border: 0;
  border-radius: 10px;
  font-size: 8px;
  font-weight: 600;
  color: ${({ active, theme }) => (active ? 'white' : theme.purple5)};
  text-transform: uppercase;
  cursor: pointer;
  &:last-child {
    margin: 0;
  }
  &:hover {
    color: ${({ theme }) => theme.text3};
    background: ${({ theme }) => theme.dark2};
  }
  &:disabled {
    pointer-events: none;
    color: ${({ theme }) => theme.dark2};
    background: ${({ theme }) => theme.dark1};
  }
`
