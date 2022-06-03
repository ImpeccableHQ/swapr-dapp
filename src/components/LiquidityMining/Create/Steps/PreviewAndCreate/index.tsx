import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Flex } from 'rebass'
import {
  LiquidityMiningCampaign,
  Pair,
  Percent,
  SingleSidedLiquidityMiningCampaign,
  Token,
  TokenAmount,
} from '@swapr/sdk'
import PoolSummary from './PoolSummary'
import RewardSummary from './RewardSummary'
import { Card, Divider, SmoothGradientCard } from '../../../styleds'
import { ButtonPrimary } from '../../../../Button'

import styled from 'styled-components'
import { useActiveWeb3React } from '../../../../../hooks'
import { CampaignCard } from '../../../../Pool/PairsList/CampaignCard'
import { getStakedAmountUSD } from '../../../../../utils/liquidityMining'
import { useNativeCurrencyUSDPrice } from '../../../../../hooks/useNativeCurrencyUSDPrice'
import { TYPE } from '../../../../../theme'
import { Repeat } from 'react-feather'
import Slider from '../../../../Slider'
import useDebouncedChangeHandler from '../../../../../utils/useDebouncedChangeHandler'

import Loader from '../../../../Loader'
import { parseUnits } from 'ethers/lib/utils'
import { calculatePercentage } from '../../../../../utils'
import { useTokenOrPairNativeCurrency } from '../../../../../hooks/useTokenOrPairNativeCurrency'

const FlexContainer = styled(Flex)`
  ${props => props.theme.mediaWidth.upToExtraSmall`
    flex-direction: column;
  `}
`

const ResponsiveContainer = styled(Box)<{ flex1?: boolean }>`
  flex: ${({ flex1 }) => (flex1 ? 1 : 'auto')};
`
const StyledCampaignCard = styled(CampaignCard)`
  width: 50%;
`
const CampaignDetailWrapper = styled(Flex)`
  gap: 32px;
`
const SimulatedValue = styled.div`
  font-style: normal;
  font-weight: 700;
  font-size: 18px;
  line-height: 22px;
  /* identical to box height */

  text-align: right;
  letter-spacing: 0.02em;
  text-transform: uppercase;

  color: ${props => props.theme.text2};
`
const StyledSwitch = styled(Repeat)`
  width: 12px;
  height: 12px;
  stroke: ${props => props.theme.text5};
  margin-left: 4px;
`
const SwitchContainer = styled.div`
  font-size: 10px;
  display: flex;
  font-weight: 600;
  color: ${props => props.theme.text5};
  line-height: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  cursor: pointer;
`
const DOLLAR_AMOUNT_MAX_SIMULATION = 10000000
interface PreviewProps {
  campaign: SingleSidedLiquidityMiningCampaign | LiquidityMiningCampaign | null
  apr: Percent
  startTime: Date | null
  endTime: Date | null
  timelocked: boolean
  stakingCap: TokenAmount | null
  approvals: boolean
  rewards: TokenAmount[]
  onCreate: () => void
  setSimulatedStakedAmount: (value: string) => void
  stakeToken?: Token
  stakePair?: Pair
}

export default function PreviewAndCreate({
  stakeToken,
  stakePair,
  startTime,
  endTime,
  timelocked,
  stakingCap,
  rewards,
  apr,
  approvals,
  onCreate,
  campaign,
  setSimulatedStakedAmount,
}: PreviewProps) {
  const { account } = useActiveWeb3React()
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false)
  const { loading: loadingNativeCurrencyUsdPrice, nativeCurrencyUSDPrice } = useNativeCurrencyUSDPrice()
  const [showUSDValue, setShowUSDValue] = useState(true)

  const { loading: loadingNativeTokenPrice, derivedNativeCurrency: nativeTokenPrice } = useTokenOrPairNativeCurrency(
    stakeToken || stakePair
  )
  const [simulatedValuePercentage, setSimulatedValuePercentage] = useState(0)

  const maxStakedSimulatedAmount = useMemo(() => {
    const base = stakingCap
      ? parseFloat(stakingCap.multiply(nativeTokenPrice.multiply(nativeCurrencyUSDPrice)).toSignificant(22))
      : DOLLAR_AMOUNT_MAX_SIMULATION

    const baseInUsd = parseFloat(nativeTokenPrice.multiply(nativeCurrencyUSDPrice).toFixed(22))

    const baseValue = showUSDValue ? base : base / baseInUsd

    const tokenOrPair = stakeToken ? stakeToken : stakePair?.liquidityToken

    if (tokenOrPair && base !== 0 && baseInUsd !== 0) {
      setSimulatedStakedAmount(
        parseUnits(
          calculatePercentage(base / baseInUsd, simulatedValuePercentage).toString(),
          tokenOrPair.decimals
        ).toString()
      )
    }

    return calculatePercentage(baseValue, simulatedValuePercentage)
  }, [
    setSimulatedStakedAmount,
    stakeToken,
    stakePair,
    simulatedValuePercentage,
    stakingCap,
    nativeTokenPrice,
    nativeCurrencyUSDPrice,
    showUSDValue,
  ])

  const liquidityPercentChangeCallback = useCallback((value: number) => {
    setSimulatedValuePercentage(value)
  }, [])

  const [innerLiquidityPercentage, setInnerLiquidityPercentage] = useDebouncedChangeHandler(
    simulatedValuePercentage,
    liquidityPercentChangeCallback,
    10
  )
  useEffect(() => {
    setAreButtonsDisabled(
      !!(
        !account ||
        !rewards ||
        (!stakeToken && !stakePair) ||
        !startTime ||
        !endTime ||
        approvals ||
        campaign === null
      )
    )
  }, [account, rewards, stakeToken, stakePair, startTime, endTime, approvals, campaign])

  const getConfirmButtonMessage = () => {
    if (!account) return 'Connect your wallet'
    else if (approvals) return 'Rewards not approved/Insufficient balance'
    else if (campaign === null) return 'One of tokens not priced'

    return 'Deposit & create'
  }
  const isSingleSided = campaign instanceof SingleSidedLiquidityMiningCampaign

  const handleUSDValueClick = useCallback(() => {
    setShowUSDValue(!showUSDValue)
  }, [showUSDValue])
  return (
    <Flex flexDirection="column" style={{ zIndex: -1 }}>
      {campaign !== null && !loadingNativeCurrencyUsdPrice && (
        <CampaignDetailWrapper flexDirection={'row'} mb="32px">
          <StyledCampaignCard
            token0={
              campaign instanceof SingleSidedLiquidityMiningCampaign
                ? campaign.stakeToken
                : campaign.targetedPair.token0
            }
            usdLiquidity={getStakedAmountUSD(campaign.staked.nativeCurrencyAmount, nativeCurrencyUSDPrice)}
            token1={campaign instanceof LiquidityMiningCampaign ? campaign.targetedPair.token1 : undefined}
            //TODO: add check for kpi token indicator containsKpiToken={campaign instanceof LiquidityMiningCampaign ? campaign.containsKpiToken : false}
            isSingleSidedStakingCampaign={isSingleSided}
            apy={apr}
            usdLiquidityText={campaign.locked ? 'LOCKED' : 'STAKED'}
            staked={true}
            campaign={campaign}
          />
          <SmoothGradientCard
            justifyContent={'space-between'}
            flexDirection={'column'}
            alignItems={'center'}
            padding={'24px 28px'}
            width={'50%'}
          >
            <TYPE.largeHeader fontSize={'11px'} letterSpacing="0.08em" color="text3">
              SIMULATED STAKED AMOUNT
            </TYPE.largeHeader>
            <SwitchContainer onClick={handleUSDValueClick}>
              Value in {showUSDValue ? 'crypto' : 'USD'}
              <StyledSwitch />
            </SwitchContainer>
            {loadingNativeTokenPrice || loadingNativeCurrencyUsdPrice ? (
              <Loader />
            ) : (
              <SimulatedValue>
                {maxStakedSimulatedAmount.toLocaleString('en-us')}{' '}
                {showUSDValue
                  ? 'USD'
                  : stakeToken
                  ? stakeToken.symbol
                  : `${stakePair?.token0.symbol}/${stakePair?.token1.symbol}`}
              </SimulatedValue>
            )}

            <Slider value={innerLiquidityPercentage} size={16} onChange={setInnerLiquidityPercentage} />
          </SmoothGradientCard>
        </CampaignDetailWrapper>
      )}

      <Box mb="40px">
        <Card>
          <FlexContainer justifyContent="stretch" width="100%">
            <PoolSummary
              stakeToken={stakeToken}
              stakePair={stakePair}
              startTime={startTime}
              endTime={endTime}
              timelocked={timelocked}
            />
            <Box mx="18px">
              <Divider />
            </Box>
            <ResponsiveContainer flex1>
              <RewardSummary stakingCap={stakingCap} rewards={rewards} apr={apr} />
            </ResponsiveContainer>
          </FlexContainer>
        </Card>
      </Box>
      <Box>
        <Card>
          <FlexContainer justifyContent="stretch" width="100%">
            <ResponsiveContainer width="100%">
              <ButtonPrimary data-testid="confirm-button" disabled={areButtonsDisabled} onClick={onCreate}>
                {getConfirmButtonMessage()}
              </ButtonPrimary>
            </ResponsiveContainer>
          </FlexContainer>
        </Card>
      </Box>
    </Flex>
  )
}
