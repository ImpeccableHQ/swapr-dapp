import { ChainId } from '@swapr/sdk'

import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { network } from '../../connectors'
import { useEagerConnect, useInactiveListener, useUnsupportedChainIdError } from '../../hooks'
import { useTargetedChainIdFromUrl } from '../../hooks/useTargetedChainIdFromUrl'
import { Loader } from '../Loader'

const MessageWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20rem;
`

const Message = styled.h2`
  color: ${({ theme }) => theme.secondary1};
`

export default function Web3ReactManager({ children }: { children: JSX.Element }) {
  const { t } = useTranslation('common')
  const { isActive, hooks } = useWeb3React()
  const { useSelectedIsActive } = hooks
  const networkIsActive = useSelectedIsActive(network)
  const targetedChainId = useTargetedChainIdFromUrl()
  const isUnsupportedChainIdError = useUnsupportedChainIdError()

  // try to eagerly connect to an injected provider, if it exists and has granted access already
  const triedEager = useEagerConnect()

  //after eagerly trying injected, if the network connect ever isn't active or in an error state, activate itd
  useEffect(() => {
    if (triedEager && !isUnsupportedChainIdError) {
      if (targetedChainId && Boolean(ChainId[targetedChainId])) {
        network.activate(targetedChainId)
      } else {
        network.activate()
      }
    }
  }, [triedEager, isUnsupportedChainIdError, targetedChainId])

  // when there's no account connected, react to logins (broadly speaking) on the injected provider, if it exists
  useInactiveListener(!triedEager)

  // handle delayed loader state
  const [showLoader, setShowLoader] = useState(false)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowLoader(true)
    }, 600)

    return () => {
      clearTimeout(timeout)
    }
  }, [])

  // on page load, do nothing until we've tried to connect to the injected connector
  if (!triedEager) {
    return null
  }

  // if the account context isn't active, and there's an error on the network context, it's an irrecoverable error
  if (!isActive && isUnsupportedChainIdError) {
    return (
      <MessageWrapper>
        <Message>{t('unknownError')}</Message>
      </MessageWrapper>
    )
  }

  // if neither context is active, spin
  if (!isActive && !networkIsActive) {
    return showLoader ? (
      <MessageWrapper>
        <Loader />
      </MessageWrapper>
    ) : null
  }

  return children
}
