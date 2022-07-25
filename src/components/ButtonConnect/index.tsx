import { useWeb3ReactCore } from 'hooks/useWeb3ReactCore'
import React from 'react'

import { ApplicationModal } from '../../state/application/actions'
import {
  useModalOpen,
  useNetworkSwitcherPopoverToggle,
  useWalletSwitcherPopoverToggle,
} from '../../state/application/hooks'
import { ButtonPrimary } from '../Button'

export const ButtonConnect = () => {
  const { isSupportedChainId } = useWeb3ReactCore()
  const toggleWalletSwitcherPopover = useWalletSwitcherPopoverToggle()
  const toggleNetworkSwitcherPopover = useNetworkSwitcherPopoverToggle()
  const networkSwitcherPopoverOpen = useModalOpen(ApplicationModal.NETWORK_SWITCHER)
  const isSwitchNetwork = networkSwitcherPopoverOpen || !isSupportedChainId

  return (
    <ButtonPrimary
      onClick={isSwitchNetwork ? toggleNetworkSwitcherPopover : toggleWalletSwitcherPopover}
      disabled={networkSwitcherPopoverOpen}
      data-testid="switch-connect-button"
    >
      {isSwitchNetwork ? 'Switch network' : 'Connect wallet'}
    </ButtonPrimary>
  )
}
