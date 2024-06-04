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
  GasPriceResponseDTOResultFast,
  GasPriceResponseDTOResultFastFromJSON,
  GasPriceResponseDTOResultFastFromJSONTyped,
  GasPriceResponseDTOResultFastToJSON,
} from './GasPriceResponseDTOResultFast'

/**
 *
 * @export
 * @interface GasPriceResponseDTOResult
 */
export interface GasPriceResponseDTOResult {
  /**
   *
   * @type {number}
   * @memberof GasPriceResponseDTOResult
   */
  chainId: number
  /**
   *
   * @type {number}
   * @memberof GasPriceResponseDTOResult
   */
  txType: number
  /**
   *
   * @type {GasPriceResponseDTOResultFast}
   * @memberof GasPriceResponseDTOResult
   */
  fast?: GasPriceResponseDTOResultFast
  /**
   *
   * @type {GasPriceResponseDTOResultFast}
   * @memberof GasPriceResponseDTOResult
   */
  normal?: GasPriceResponseDTOResultFast
  /**
   *
   * @type {GasPriceResponseDTOResultFast}
   * @memberof GasPriceResponseDTOResult
   */
  slow?: GasPriceResponseDTOResultFast
}

export function GasPriceResponseDTOResultFromJSON(json: any): GasPriceResponseDTOResult {
  return GasPriceResponseDTOResultFromJSONTyped(json, false)
}

export function GasPriceResponseDTOResultFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): GasPriceResponseDTOResult {
  if (json === undefined || json === null) {
    return json
  }
  return {
    chainId: json['chainId'],
    txType: json['txType'],
    fast: !exists(json, 'fast') ? undefined : GasPriceResponseDTOResultFastFromJSON(json['fast']),
    normal: !exists(json, 'normal') ? undefined : GasPriceResponseDTOResultFastFromJSON(json['normal']),
    slow: !exists(json, 'slow') ? undefined : GasPriceResponseDTOResultFastFromJSON(json['slow']),
  }
}

export function GasPriceResponseDTOResultToJSON(value?: GasPriceResponseDTOResult | null): any {
  if (value === undefined) {
    return undefined
  }
  if (value === null) {
    return null
  }
  return {
    chainId: value.chainId,
    txType: value.txType,
    fast: GasPriceResponseDTOResultFastToJSON(value.fast),
    normal: GasPriceResponseDTOResultFastToJSON(value.normal),
    slow: GasPriceResponseDTOResultFastToJSON(value.slow),
  }
}
