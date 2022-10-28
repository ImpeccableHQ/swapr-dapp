import { AdapterKey, AdapterPayloadType } from '../../advancedTradingView.types'

export enum LiquidityTypename {
  BURN = 'Burn',
  MINT = 'Mint',
}

// subgraph types
export interface PairBurnsAndMintsTransaction {
  id: string
  transaction: {
    id: string
  }
  amount0: string
  amount1: string
  amountUSD: string
  timestamp: string
  type: LiquidityTypename
}

interface PairSwapTransaction {
  amount0In: string
  amount0Out: string
  amount1In: string
  amount1Out: string
  amountUSD: string
  id: string
  timestamp: string
  transaction: { id: string }
}

export interface SwapsWithLogo extends PairSwapTransaction {
  logoKey: string
}
interface BurnsAndMintsWithLogo extends PairBurnsAndMintsTransaction {
  logoKey: string
}

export type AllTradesAndLiquidityFromAdapters = {
  swaps: SwapsWithLogo[]
  burnsAndMints: BurnsAndMintsWithLogo[]
}

export type PairSwaps = {
  swaps: PairSwapTransaction[]
}

export type PairBurnsAndMints = {
  burns: PairBurnsAndMintsTransaction[]
  mints: PairBurnsAndMintsTransaction[]
}

export type BaseActionPayload<DataType> = {
  key: AdapterKey
  hasMore: boolean
  pairId: string
  data: DataType
  payloadType: AdapterPayloadType.SWAPS | AdapterPayloadType.BURNS_AND_MINTS
}

export type BasePair = {
  swaps?: { data: PairSwapTransaction[]; hasMore: boolean }
  burnsAndMints?: { data: PairBurnsAndMintsTransaction[]; hasMore: boolean }
}
