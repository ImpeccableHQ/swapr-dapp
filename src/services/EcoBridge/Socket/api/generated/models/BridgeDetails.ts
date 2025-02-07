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
/**
 *
 * @export
 * @interface BridgeDetails
 */
export interface BridgeDetails {
  /**
   * Name of bridge.
   * @type {string}
   * @memberof BridgeDetails
   */
  bridgeName: BridgeDetailsBridgeNameEnum
  /**
   * URL for icon of bridge.
   * @type {string}
   * @memberof BridgeDetails
   */
  icon?: string
  /**
   * Approx time for bridging in seconds.
   * @type {number}
   * @memberof BridgeDetails
   */
  serviceTime: number
  /**
   * Display name of bridge.
   * @type {string}
   * @memberof BridgeDetails
   */
  displayName: string
}

/**
 * @export
 * @enum {string}
 */
export enum BridgeDetailsBridgeNameEnum {
  PolygonBridge = 'polygon-bridge',
  Hop = 'hop',
  AnyswapRouterV4 = 'anyswap-router-v4',
  Hyphen = 'hyphen',
  ArbitrumBridge = 'arbitrum-bridge',
  Connext = 'connext',
}

export function BridgeDetailsFromJSON(json: any): BridgeDetails {
  return BridgeDetailsFromJSONTyped(json, false)
}

export function BridgeDetailsFromJSONTyped(json: any, ignoreDiscriminator: boolean): BridgeDetails {
  if (json === undefined || json === null) {
    return json
  }
  return {
    bridgeName: json['bridgeName'],
    icon: !exists(json, 'icon') ? undefined : json['icon'],
    serviceTime: json['serviceTime'],
    displayName: json['displayName'],
  }
}

export function BridgeDetailsToJSON(value?: BridgeDetails | null): any {
  if (value === undefined) {
    return undefined
  }
  if (value === null) {
    return null
  }
  return {
    bridgeName: value.bridgeName,
    icon: value.icon,
    serviceTime: value.serviceTime,
    displayName: value.displayName,
  }
}
