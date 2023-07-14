import Skeleton from 'react-loading-skeleton'
import { useDispatch } from 'react-redux'
import { Box, Text } from 'rebass'
import styled from 'styled-components'

import QuestionHelper from '../../components/QuestionHelper'
import {
  SelectionListDetails,
  SelectionListLabel,
  SelectionListLabelWrapper,
  SelectionListName,
  SelectionListOption,
  SelectionListReceiveAmount,
  SelectionListWindowWrapper,
} from '../../components/SelectionList'
import { useActiveBridge, useAvailableBridges } from '../../services/EcoBridge/EcoBridge.hooks'
import { BridgeDetails, BridgeIdList, OptionalBridgeIdList, SyncState } from '../../services/EcoBridge/EcoBridge.types'
import { commonActions } from '../../services/EcoBridge/store/Common.reducer'
import { ecoBridgeUIActions } from '../../services/EcoBridge/store/UI.reducer'

export const BridgeSelectionWindow = () => {
  const dispatch = useDispatch()
  const activeBridge = useActiveBridge()
  const availableBridges = useAvailableBridges()

  const handleSelectBridge = (id: OptionalBridgeIdList, url: string, receiveAmount?: string, routeId?: string) => {
    dispatch(commonActions.setActiveBridge(id))
    dispatch(commonActions.setActiveBridgeUrl(url))
    dispatch(ecoBridgeUIActions.setTo({ value: receiveAmount }))
    if (routeId) {
      dispatch(commonActions.setActiveRouteId(routeId))
    }
  }

  return (
    <>
      {!!availableBridges.length && (
        <SelectionListWindowWrapper extraMarginTop="10px">
          <SelectionListLabelWrapper>
            <SelectionListLabel flex="35%" justify="start">
              Bridge
            </SelectionListLabel>
            <SelectionListLabel>Fee</SelectionListLabel>
            <SelectionListLabel>Gas</SelectionListLabel>
            <SelectionListLabel>Time</SelectionListLabel>
            <SelectionListLabel flex="22%" justify="end">
              Amount
            </SelectionListLabel>
          </SelectionListLabelWrapper>
          {availableBridges.map(({ bridgeId, name, url, details, status }) => (
            <Bridge
              id={bridgeId}
              key={bridgeId}
              name={name}
              url={url}
              activeBridge={activeBridge}
              details={details}
              status={status}
              handleSelectBridge={handleSelectBridge}
            />
          ))}
        </SelectionListWindowWrapper>
      )}

      {!availableBridges.length && (
        <Box sx={{ margin: '15px 0', width: '100%' }}>
          <Text sx={{ textAlign: 'center', color: '#464366' }}>No available bridges</Text>
        </Box>
      )}
    </>
  )
}

interface BridgeProps {
  id: BridgeIdList
  name: string
  url: string
  activeBridge: OptionalBridgeIdList
  details: BridgeDetails
  status: SyncState
  handleSelectBridge: (id: OptionalBridgeIdList, url: string, receiveAmount?: string, routeId?: string) => void
}

const Bridge = ({ id, name, url, activeBridge, details, status, handleSelectBridge }: BridgeProps) => {
  const isSelected = id === activeBridge
  const isLoading = status === 'loading'
  const show = status !== 'loading' && details

  return (
    <SelectionListOption
      data-testid={`${name.toLowerCase()}-bridge`}
      isSelected={isSelected}
      isLoading={isLoading}
      onClick={() => {
        if (!isLoading) {
          handleSelectBridge(id, url, details.receiveAmount, details.routeId)
        }
      }}
    >
      <SelectionListName flex="35%" isSelected={isSelected}>
        {name}
      </SelectionListName>
      <SelectionListDetails data-testid="fee-amount" justify="center">
        {!show ? (
          <Skeleton width="25px" height="9px" />
        ) : !details.fee ? (
          <QuestionHelperWarning text="Cannot estimate fee" />
        ) : (
          details.fee
        )}
      </SelectionListDetails>
      <SelectionListDetails data-testid="bridge-gas" justify="center">
        {!show ? (
          <Skeleton width="25px" height="9px" />
        ) : !details.gas ? (
          <QuestionHelperWarning text="Cannot estimate gas" />
        ) : (
          details.gas
        )}
      </SelectionListDetails>
      <SelectionListDetails data-testid="estimated-time" justify="center">
        {!show ? <Skeleton width="25px" height="9px" /> : details.estimateTime}
      </SelectionListDetails>
      <SelectionListReceiveAmount flex="22%" data-testid="bridge-amount">
        {!show ? <Skeleton width="25px" height="9px" /> : details.receiveAmount}
      </SelectionListReceiveAmount>
    </SelectionListOption>
  )
}

const QuestionHelperWarning = styled(QuestionHelper)`
  width: 12px;
  height: 12px;

  svg {
    stroke: ${({ theme }) => theme.orange1};
  }
`
