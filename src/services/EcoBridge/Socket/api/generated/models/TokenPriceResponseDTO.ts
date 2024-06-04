/* tslint:disable */
/* eslint-disable */
/**
 * Movr Aggregator API
 * The Movr Aggregator API description
 *
 * The version of the OpenAPI document: 1.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime'
import {
  TokenPriceResponseDTOResult,
  TokenPriceResponseDTOResultFromJSON,
  TokenPriceResponseDTOResultFromJSONTyped,
  TokenPriceResponseDTOResultToJSON,
} from './TokenPriceResponseDTOResult'

/**
 *
 * @export
 * @interface TokenPriceResponseDTO
 */
export interface TokenPriceResponseDTO {
  /**
   *
   * @type {boolean}
   * @memberof TokenPriceResponseDTO
   */
  success: boolean
  /**
   *
   * @type {TokenPriceResponseDTOResult}
   * @memberof TokenPriceResponseDTO
   */
  result: TokenPriceResponseDTOResult
}

export function TokenPriceResponseDTOFromJSON(json: any): TokenPriceResponseDTO {
  return TokenPriceResponseDTOFromJSONTyped(json, false)
}

export function TokenPriceResponseDTOFromJSONTyped(json: any, ignoreDiscriminator: boolean): TokenPriceResponseDTO {
  if (json === undefined || json === null) {
    return json
  }
  return {
    success: json['success'],
    result: TokenPriceResponseDTOResultFromJSON(json['result']),
  }
}

export function TokenPriceResponseDTOToJSON(value?: TokenPriceResponseDTO | null): any {
  if (value === undefined) {
    return undefined
  }
  if (value === null) {
    return null
  }
  return {
    success: value.success,
    result: TokenPriceResponseDTOResultToJSON(value.result),
  }
}
