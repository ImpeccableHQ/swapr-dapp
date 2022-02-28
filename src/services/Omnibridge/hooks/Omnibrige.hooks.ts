import { useDispatch, useSelector } from 'react-redux'
import { AppState } from '../../../state'
import { useActiveWeb3React } from '../../../hooks'
import {
  selectAllTokensPerChain,
  selectAllActiveTokens,
  selectAllLists,
  selectListsLoading,
  selectSupportedBridgesForUI
} from '../store/Omnibridge.selectors'
import { commonActions } from '../store/Common.reducer'
import { useCallback } from 'react'

export const useAllBridgeTokens = () => {
  const { chainId } = useActiveWeb3React()
  const tokens = useSelector((state: AppState) => selectAllTokensPerChain(state, chainId ?? 0))

  return tokens
}

export const useBridgeActiveTokenMap = () => {
  const tokenMap = useSelector(selectAllActiveTokens)

  return tokenMap
}

export const useAllBridgeLists = () => {
  const allLists = useSelector(selectAllLists)

  return allLists
}

export const useActiveListsHandlers = () => {
  const dispatch = useDispatch()
  const activeLists = useSelector((state: AppState) => state.omnibridge.common.activeLists)

  return {
    activateList: useCallback((listId: string) => dispatch(commonActions.activateLists([listId])), [dispatch]),
    deactivateList: useCallback((listId: string) => dispatch(commonActions.deactivateLists([listId])), [dispatch]),
    isListActive: useCallback((listId: string) => activeLists.includes(listId), [activeLists])
  }
}

export const useBridgeListsLoadingStatus = () => {
  const isLoading = useSelector(selectListsLoading)

  return isLoading
}

export const useShowAvailableBridges = () => {
  const { showAvailableBridges } = useSelector((state: AppState) => state.omnibridge.UI)

  return showAvailableBridges
}
export const useAvailableBridges = () => {
  const availableBridges = useSelector(selectSupportedBridgesForUI)

  return availableBridges
}

export const useActiveBridge = () => {
  const activeBridge = useSelector((state: AppState) => state.omnibridge.common.activeBridge)

  return activeBridge
}

export const useActiveRoute = () => {
  const activeRouteId = useSelector((state: AppState) => state.omnibridge.common.activeRouteId)

  return activeRouteId
}
