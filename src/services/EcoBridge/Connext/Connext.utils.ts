import { Logger } from '@connext/nxtp-utils'
import { gql } from 'graphql-request'

/**
 * Used to suppress logs from connext sdk
 */
export class SilentLogger extends Logger {
  constructor(...args: any[]) {
    super(args)
    this['print'] = () => {
      return
    }

    this.child = (...any: any[]) => {
      return new SilentLogger(...any)
    }
  }
}

export const QUERY_NATIVE_PRICE = gql`
  query {
    bundle(id: "1") {
      nativeCurrencyPrice
    }
  }
`

export const getTransactionsQuery = (account: string) => {
  return `{
    transactions(where: {initiator: "${account}"}) {
      id
      status
      chainId
      preparedTimestamp
      receivingChainTxManagerAddress
      user {
        id
      }
      router {
        id
      }
      initiator
      sendingAssetId
      receivingAssetId
      sendingChainFallback
      callTo
      receivingAddress
      callDataHash
      transactionId
      sendingChainId
      receivingChainId
      amount
      expiry
      preparedBlockNumber
      encryptedCallData
      prepareCaller
      bidSignature
      encodedBid
      prepareTransactionHash
      prepareMeta
      relayerFee
      signature
      callData
      externalCallSuccess
      externalCallIsContract
      externalCallReturnData
      fulfillCaller
      fulfillTransactionHash
      fulfillMeta
      fulfillTimestamp
      cancelCaller
      cancelTransactionHash
      cancelMeta
      cancelTimestamp
    }
  }
`
}

export const getReceivingTransaction = (transactionId: string) => {
  return `{
    transactions(where: {transactionId: "${transactionId}"}) {
      id
      status
      chainId
      preparedTimestamp
      receivingChainTxManagerAddress
      user {
        id
      }
      router {
        id
      }
      initiator
      sendingAssetId
      receivingAssetId
      sendingChainFallback
      callTo
      receivingAddress
      callDataHash
      transactionId
      sendingChainId
      receivingChainId
      amount
      expiry
      preparedBlockNumber
      encryptedCallData
      prepareCaller
      bidSignature
      encodedBid
      prepareTransactionHash
      prepareMeta
      relayerFee
      signature
      callData
      externalCallSuccess
      externalCallIsContract
      externalCallReturnData
      fulfillCaller
      fulfillTransactionHash
      fulfillMeta
      fulfillTimestamp
      cancelCaller
      cancelTransactionHash
      cancelMeta
      cancelTimestamp
    }
  }
`
}
