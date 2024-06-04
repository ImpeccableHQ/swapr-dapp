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
  GasPriceResponseDTOResult,
  GasPriceResponseDTOResultFromJSON,
  GasPriceResponseDTOResultFromJSONTyped,
  GasPriceResponseDTOResultToJSON,
} from './GasPriceResponseDTOResult'

/**
 *
 * @export
 * @interface GasPriceResponseDTO
 */
export interface GasPriceResponseDTO {
  /**
   *
   * @type {boolean}
   * @memberof GasPriceResponseDTO
   */
  success: boolean
  /**
   *
   * @type {GasPriceResponseDTOResult}
   * @memberof GasPriceResponseDTO
   */
  result: GasPriceResponseDTOResult
}

export function GasPriceResponseDTOFromJSON(json: any): GasPriceResponseDTO {
  return GasPriceResponseDTOFromJSONTyped(json, false)
}

export function GasPriceResponseDTOFromJSONTyped(json: any, ignoreDiscriminator: boolean): GasPriceResponseDTO {
  if (json === undefined || json === null) {
    return json
  }
  return {
    success: json['success'],
    result: GasPriceResponseDTOResultFromJSON(json['result']),
  }
}

export function GasPriceResponseDTOToJSON(value?: GasPriceResponseDTO | null): any {
  if (value === undefined) {
    return undefined
  }
  if (value === null) {
    return null
  }
  return {
    success: value.success,
    result: GasPriceResponseDTOResultToJSON(value.result),
  }
}
