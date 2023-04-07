import { Trade } from '@swapr/sdk'

import { motion } from 'framer-motion'
import { useCallback, useContext } from 'react'
import styled from 'styled-components'

import { SwapContext } from '../../../Swap/SwapBox/SwapContext'
import { PlatformItem } from './PlatformItem'

type PlatformsListProps = {
  loading: boolean
  allPlatformTrades?: (Trade | undefined)[]
  selectedTrade?: Trade
  outputCurrencySymbol?: string
}

export function PlatformsList({ loading, allPlatformTrades, selectedTrade, outputCurrencySymbol }: PlatformsListProps) {
  const { setPlatformOverride } = useContext(SwapContext)

  const handleSelectedTradeOverride = useCallback(
    (platformName: string) => {
      const newTrade = allPlatformTrades?.find(trade => trade?.platform.name === platformName)
      if (!newTrade) return
      setPlatformOverride(newTrade.platform)
    },
    [allPlatformTrades, setPlatformOverride]
  )

  return (
    <Container
      initial={{ height: 0 }}
      animate={{
        height: 'auto',
        transition: {
          duration: 0.2,
        },
      }}
      exit={{
        height: 0,
        transition: {
          duration: 0.1,
        },
      }}
    >
      {!loading &&
        allPlatformTrades?.length !== 0 &&
        allPlatformTrades?.map((trade, index) => {
          if (!trade) return null

          return (
            <PlatformItem
              key={trade.platform.name}
              bestRoute={index === 0}
              isSelected={selectedTrade?.platform.name === trade.platform.name}
              trade={trade}
              onClick={() => handleSelectedTradeOverride(trade.platform.name)}
              outputCurrencySymbol={outputCurrencySymbol}
            />
          )
        })}
    </Container>
  )
}

const Container = styled(motion.div)`
  margin-top: 9px;
`
