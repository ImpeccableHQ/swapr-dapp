import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ReactComponent as EcoRouter } from '../../assets/svg/eco-router.svg'
import { useActiveWeb3React } from '../../hooks'
import { SwapTabs } from '../../state/user/reducer'
import { chainSupportsSWPR } from '../../utils/chainSupportsSWPR'
import Row from '../Row'

const TabsColumn = styled.div`
  max-width: 457px;
  width: 100%;
`

const TabsRow = styled(Row)`
  display: inline-flex;
  width: auto;
  margin: 0 0 10px;
  padding: 2px;
  background: ${({ theme }) => theme.bg6};
  border-radius: 12px;
`

const Button = styled.button`
  display: flex;
  align-items: center;
  padding: 7px 10px;
  font-weight: 600;
  font-size: 11px;
  line-height: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.text5};
  border-radius: 10px;
  border: none;
  background: none;
  cursor: pointer;

  &.active {
    color: #ffffff;
    background: ${({ theme }) => theme.bg2};
    font-size: 12px;
    line-height: 14px;
  }

  &:disabled {
    color: ${({ theme }) => theme.text6};
    cursor: not-allowed;
  }
`

const StyledEcoRouter = styled(EcoRouter)`
  margin-right: 5px;
`

export const Tabs = ({ activeTab, setActiveTab }: { activeTab: SwapTabs; setActiveTab: (tab: SwapTabs) => void }) => {
  const { t } = useTranslation('swap')
  const { chainId } = useActiveWeb3React()
  const isSupportedChain = chainSupportsSWPR(chainId)

  return (
    <TabsColumn>
      <TabsRow>
        <Button
          onClick={() => setActiveTab(SwapTabs.SWAP)}
          className={activeTab === SwapTabs.SWAP || !isSupportedChain ? 'active' : ''}
          title="Swap with Eco Router V1.5"
        >
          <StyledEcoRouter />
          Swap
        </Button>
        <Button
          disabled={!isSupportedChain}
          onClick={() => setActiveTab(SwapTabs.ADVANCED_SWAP_MODE)}
          className={activeTab === SwapTabs.ADVANCED_SWAP_MODE && isSupportedChain ? 'active' : ''}
          title="Advanced Trade View"
        >
          Adv. Trade
        </Button>
        <Button disabled={true} title="Limit order">
          {t('tabs.limit')}
        </Button>
        <Button disabled={true} title="Bridge Swap">
          {t('tabs.bridgeSwap')}
        </Button>
      </TabsRow>
    </TabsColumn>
  )
}
