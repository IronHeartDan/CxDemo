export type OrderSide_LT = 'BUY' | 'SELL'

export const enum OrderSide {
    BUY = 'BUY',
    SELL = 'SELL',
}

export type PositionSide_LT = 'BOTH' | 'SHORT' | 'LONG'

export const enum PositionSide {
    BOTH = 'BOTH',
    SHORT = 'SHORT',
    LONG = 'LONG',
}

export type TimeInForce_LT = 'GTC' | 'IOC' | 'FOK'

export const enum TimeInForce {
    GTC = 'GTC',
    IOC = 'IOC',
    FOK = 'FOK',
}

export type FuturesOrderType_LT =
    | 'LIMIT'
    | 'MARKET'
    | 'STOP'
    | 'TAKE_PROFIT'
    | 'STOP_MARKET'
    | 'TAKE_PROFIT_MARKET'
    | 'TRAILING_STOP_MARKET'

export enum OrderType {
    LIMIT = 'LIMIT',
    LIMIT_MAKER = 'LIMIT_MAKER',
    MARKET = 'MARKET',
    STOP = 'STOP',
    STOP_MARKET = 'STOP_MARKET',
    STOP_LOSS_LIMIT = 'STOP_LOSS_LIMIT',
    TAKE_PROFIT_LIMIT = 'TAKE_PROFIT_LIMIT',
    TAKE_PROFIT_MARKET = 'TAKE_PROFIT_MARKET',
    TRAILING_STOP_MARKET = 'TRAILING_STOP_MARKET',
}

export interface NewFuturesOrderBase {
    symbol: string
    side: OrderSide_LT
    // Default BOTH for One-way Mode ; LONG or SHORT for Hedge Mode. It must be sent in Hedge Mode.
    positionSide?: PositionSide_LT
    type: FuturesOrderType_LT
    timeInForce?: TimeInForce_LT
}

export interface LimitNewFuturesOrder extends NewFuturesOrderBase {
    type: 'LIMIT'
    timeInForce: TimeInForce_LT
    quantity: string
    price: string
}

export interface MarketNewFuturesOrder extends NewFuturesOrderBase {
    type: 'MARKET'
    quantity: string
}

export interface StopNewFuturesOrder extends NewFuturesOrderBase {
    type: 'STOP'
    quantity: string
    price: string
    stopPrice: string
    // "TRUE" or "FALSE", default "FALSE". Used with STOP/STOP_MARKET or TAKE_PROFIT/TAKE_PROFIT_MARKET orders.
    priceProtect?: 'TRUE' | 'FALSE'
}

export interface TakeProfitNewFuturesOrder extends NewFuturesOrderBase {
    type: 'TAKE_PROFIT'
    quantity: string
    price: string
    stopPrice: string
}

export interface StopMarketNewFuturesOrder extends NewFuturesOrderBase {
    type: 'STOP_MARKET'
    stopPrice: string
    // true, false；Close-All，used with STOP_MARKET or TAKE_PROFIT_MARKET.
    closePosition?: 'true' | 'false'
    // "TRUE" or "FALSE", default "FALSE". Used with STOP/STOP_MARKET or TAKE_PROFIT/TAKE_PROFIT_MARKET orders.
    priceProtect?: 'TRUE' | 'FALSE'
    quantity?: string
}

export interface TakeProfitMarketNewFuturesOrder extends NewFuturesOrderBase {
    type: 'TAKE_PROFIT_MARKET'
    stopPrice: string
    // true, false；Close-All，used with STOP_MARKET or TAKE_PROFIT_MARKET.
    closePosition?: 'true' | 'false'
    // "TRUE" or "FALSE", default "FALSE". Used with STOP/STOP_MARKET or TAKE_PROFIT/TAKE_PROFIT_MARKET orders.
    priceProtect?: 'TRUE' | 'FALSE'
    quantity?: string
}

export interface TrailingStopMarketNewFuturesOrder extends NewFuturesOrderBase {
    type: 'TRAILING_STOP_MARKET'
    // default as the latest price(supporting different workingType)
    activationPrice?: string
    // min 0.1, max 5 where 1 for 1%
    callbackRate?: string
}

export type NewFuturesOrder =
    | LimitNewFuturesOrder
    | MarketNewFuturesOrder
    | StopNewFuturesOrder
    | TakeProfitNewFuturesOrder
    | TrailingStopMarketNewFuturesOrder
    | StopMarketNewFuturesOrder
    | TakeProfitMarketNewFuturesOrder