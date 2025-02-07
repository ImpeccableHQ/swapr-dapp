import type { Signer } from '@ethersproject/abstract-signer'
import { CoWTrade, JSBI } from '@swapr/sdk'

import contractNetworks from '@cowprotocol/contracts/networks.json'
import { OrderKind as CoWOrderKind } from '@cowprotocol/cow-sdk'
import type { UnsignedOrder } from '@cowprotocol/cow-sdk/dist/utils/sign'

import cowAppData from '../generated/cow-app-data/app-data.json'
import { LimitOrderKind, SerializableLimitOrder, SerializableSignedLimitOrder } from '../interfaces'

export const COW_APP_DATA = cowAppData

/**
 * Returns the IPFS hash of the appData for the current chainId
 * @param chainId The chainId of the network
 * @returns
 */
export function getAppDataIPFSHash(chainId: number): string {
  // @ts-ignore
  return cowAppData[chainId as any].ipfsHashInfo.hash
}

export interface SignLimitOrderParams {
  order: SerializableLimitOrder
  signer: Signer
  chainId: number
}

type GetLimitOrderQuoteParams = SignLimitOrderParams

/**
 * Fetches a quote from the CoW API
 * @returns
 */
export async function getQuote({ order, signer, chainId }: GetLimitOrderQuoteParams) {
  const { buyToken, receiverAddress, userAddress, expiresAt, sellAmount, sellToken, kind, buyAmount } = order

  // const cowSdk = getCoWSdk(chainId, signer)
  const cowSdk = CoWTrade.getCowSdk(chainId, {
    signer,
    appDataHash: getAppDataIPFSHash(chainId),
  })

  let cowQuote: Awaited<ReturnType<typeof cowSdk.cowApi.getQuote>>

  if (kind === LimitOrderKind.BUY) {
    cowQuote = await cowSdk.cowApi.getQuote({
      appData: getAppDataIPFSHash(chainId),
      buyAmountAfterFee: buyAmount,
      buyToken,
      from: userAddress,
      kind: CoWOrderKind.BUY,
      partiallyFillable: false,
      receiver: receiverAddress,
      sellToken,
      validTo: expiresAt,
    })
  } else {
    cowQuote = await cowSdk.cowApi.getQuote({
      appData: getAppDataIPFSHash(chainId),
      buyToken,
      sellAmountBeforeFee: sellAmount,
      from: userAddress,
      kind: CoWOrderKind.SELL,
      partiallyFillable: false,
      receiver: receiverAddress,
      sellToken,
      validTo: expiresAt,
    })
  }

  return cowQuote
}

/**
 * Signs a limit order to produce a EIP712-compliant signature
 */
export async function signLimitOrder({
  order,
  signer,
  chainId,
}: SignLimitOrderParams): Promise<SerializableSignedLimitOrder> {
  const cowSdk = CoWTrade.getCowSdk(chainId, {
    signer,
    appDataHash: getAppDataIPFSHash(chainId),
  })

  // Get feeAmount from CoW
  const {
    buyAmount,
    buyToken,
    receiverAddress,
    feeAmount,
    expiresAt,
    sellAmount: quoteSellAmount,
    sellToken,
    kind,
  } = order

  const sellAmount = JSBI.add(JSBI.BigInt(quoteSellAmount.toString()), JSBI.BigInt(feeAmount.toString())).toString()

  const signedResult = await cowSdk.signOrder({
    buyAmount,
    buyToken,
    sellAmount,
    sellToken,
    feeAmount: '0',
    receiver: receiverAddress, // the account that will receive the order
    validTo: expiresAt,
    kind: kind === LimitOrderKind.BUY ? CoWOrderKind.BUY : CoWOrderKind.SELL,
    partiallyFillable: false,
  })

  if (!signedResult || !signedResult.signature) {
    throw new Error('Failed to sign order')
  }

  return {
    ...order,
    feeAmount,
    signature: signedResult.signature,
    signingScheme: signedResult.signingScheme,
  }
}

export async function createCoWLimitOrder({ order, signer, chainId }: GetLimitOrderQuoteParams) {
  const cowSdk = CoWTrade.getCowSdk(chainId, {
    signer,
    appDataHash: getAppDataIPFSHash(chainId),
  })

  const sellAmount = JSBI.add(
    JSBI.BigInt(order.sellAmount.toString()),
    JSBI.BigInt(order.feeAmount.toString())
  ).toString()

  const cowUnsignedOrder: Omit<UnsignedOrder, 'appData'> = {
    buyAmount: order.buyAmount,
    buyToken: order.buyToken,
    sellAmount: sellAmount,
    sellToken: order.sellToken,
    feeAmount: '0',
    receiver: order.receiverAddress, // the account that will receive the order
    validTo: order.expiresAt,
    kind: order.kind === LimitOrderKind.BUY ? CoWOrderKind.BUY : CoWOrderKind.SELL,
    partiallyFillable: false,
  }

  // Sign the order
  const signingResult = await cowSdk.signOrder(cowUnsignedOrder)

  if (!signingResult || !signingResult.signature) {
    throw new Error('Failed to sign order')
  }

  return cowSdk.cowApi.sendOrder({
    order: {
      // Unsigned order
      ...cowUnsignedOrder,
      // signature part
      signature: signingResult.signature,
      signingScheme: signingResult.signingScheme,
    },
    owner: order.userAddress,
  })
}

/**
 * Returns the vault relayer contract address for the given chain.
 * ERC20 tokens must approve this address.
 * @param chainId The chain Id
 * @returns The vault relayer address
 */
export type GPV2ContractChainId = keyof typeof contractNetworks.GPv2VaultRelayer
export function getVaultRelayerAddress(chainId: GPV2ContractChainId) {
  const gpv2RelayerChainIds = Object.keys(JSON.parse(JSON.stringify(contractNetworks.GPv2VaultRelayer)))

  if (!chainId || !gpv2RelayerChainIds.includes(chainId.toString())) return undefined

  const GPv2VaultRelayer = contractNetworks.GPv2VaultRelayer as Record<
    GPV2ContractChainId,
    Record<'transactionHash' | 'address', string>
  >

  return GPv2VaultRelayer[chainId]?.address
}
