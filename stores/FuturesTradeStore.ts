import axios from "axios"
import { makeAutoObservable, runInAction } from "mobx"
import { Ticker, MarkPrice, TradeData, StreamTradeData, AccountInfo, Position, MarketSymbol, Order } from "../types/BinanceTypes"
import { client } from "../utils/ApiManage"
import binanceClient from "../utils/BinanceClient"
import { FuturesOrderType_LT, NewFuturesOrder, NewFuturesOrderBase, OrderSide_LT } from "../types/FuturesOrderTypes"
// const WsBase = "wss://fstream.binance.com"
const WsBase = "wss://testnet.binancefuture.com"

const endpoints = {
    tradeHistory: "/binance-exchange/futures-trade-history",
    orders: "/binance-exchange/open-futures-orders",
    positions: "/binance-exchange/open-futures-positions",
    listenKey: "/binance-exchange/futures/listenKey"
}

class FuturesTradeStore {
    // User Info
    isFuturesEnabled = true
    totalWalletBalance = 0
    totalMarginBalance = 0
    totalPNL = 0
    orders: Order[] = []
    positions: Position[] = []


    // Market Info
    isMarketConnected = false
    currentSymbol = 'BTCUSDT'
    exchangeInfo: any | null = null
    marketSymbols: Map<string, MarketSymbol> = new Map()
    private marketWS: WebSocket | null = null
    private userWS: WebSocket | null = null
    tradeHistory: any[] = []
    orderBook = { a: [], b: [], loaded: false }
    symbolTicker: Map<string, Ticker> = new Map()
    symbolMarkPrice: Map<string, MarkPrice> = new Map()

    private static instance: FuturesTradeStore | null = null

    static getInstance(): FuturesTradeStore {
        if (!FuturesTradeStore.instance) {
            FuturesTradeStore.instance = new FuturesTradeStore()
        }

        return FuturesTradeStore.instance
    }

    constructor() {
        makeAutoObservable(this)
        // this.checkFuturesEnabled()
        // this.loadAll()
    }

    private checkFuturesEnabled = async () => {
        const res = await client.get('/binance-sub-accounts/1991/check-futures-enabled')
        if (res.status === 200) {
            runInAction(() => {
                this.isFuturesEnabled = res.data.futures_enabled
            })
        }
    }

    changeCurrentSymbol = (symbol: string) => {
        if (symbol === this.currentSymbol) return
        runInAction(() => {
            this.currentSymbol = symbol
            this.exchangeInfo = null
            this.tradeHistory = []
            this.orderBook = { a: [], b: [], loaded: false }
            this.symbolTicker.clear()
            this.symbolMarkPrice.clear()
        })


        this.marketWS?.close()
        this.marketWS = null

        this.loadAllFromBinance()
        this.initMarketSocket()
    }

    loadAll = () => {
        this.fetchOrders()
        this.fetchPositions()
    }

    fetchOrders = async () => {
        const res = await client.get(endpoints.orders)
        const resOrders: Order[] = [...res.data]
        runInAction(() => {
            this.orders = resOrders
        })
    }

    fetchPositions = async () => {
        const res = await client.get(endpoints.positions)
        const resPositions: Position[] = [...res.data]
        runInAction(() => {
            this.positions = resPositions
        })
    }

    loadAllFromBinance = async () => {
        const exchangeInfo = await binanceClient.futuresExchangeInfo()
        const marketSymbols: Map<string, MarketSymbol> = new Map()
        exchangeInfo.symbols.filter((s: MarketSymbol) => s.status === 'TRADING' && s.contractType === 'PERPETUAL').forEach((symbol: MarketSymbol) => {
            marketSymbols.set(symbol.symbol, symbol)
        })
        const stats = await binanceClient.dailyStats()
        const orderBookres = await binanceClient.futuresBook({ symbol: this.currentSymbol, limit: 10 })
        const asksArray = orderBookres.asks.map((entry: any) => [parseFloat(entry.price), parseFloat(entry.quantity)])
        const bidsArray = orderBookres.bids.map((entry: any) => [parseFloat(entry.price), parseFloat(entry.quantity)])
        const orderBook = { a: asksArray, b: bidsArray }
        const trades = await binanceClient.futuresAggTrades({ symbol: this.currentSymbol, limit: 10 })
        const accInfo: AccountInfo = await binanceClient.futuresAccountInfo()
        const orders = await binanceClient.futuresOpenOrders({
            symbol: this.currentSymbol
        })
        // const positions = await binanceClient.futuresPositionRisk()
        const openPositions = accInfo.positions.filter((position) => parseFloat(position.positionAmt) !== 0)
        runInAction(() => {
            this.exchangeInfo = exchangeInfo
            if (Array.isArray(stats)) {
                for (const data of stats) {
                    const ticker: Ticker = {
                        e: "24hrTicker",
                        E: data.closeTime,
                        s: data.symbol,
                        p: data.priceChange,
                        P: data.priceChangePercent,
                        w: data.weightedAvgPrice,
                        c: data.lastPrice,
                        Q: data.lastQty,
                        o: data.openPrice,
                        h: data.highPrice,
                        l: data.lowPrice,
                        v: data.volume,
                        q: data.quoteVolume,
                        O: data.openTime,
                        C: data.closeTime,
                        F: data.firstId,
                        L: data.lastId,
                        n: data.count,
                    }
                    this.symbolTicker.set(ticker.s, ticker)
                }
            }
            this.marketSymbols = marketSymbols
            this.orderBook = { a: orderBook.a, b: orderBook.b, loaded: true }
            this.totalWalletBalance = parseFloat(accInfo.totalWalletBalance)
            this.totalMarginBalance = parseFloat(accInfo.totalMarginBalance)
            this.totalPNL = parseFloat(accInfo.totalUnrealizedProfit)
            this.tradeHistory = trades.reverse()
            this.orders = orders
            this.positions = openPositions
        })
    }


    placeOrder = async ({ side, orderType, orderQuantity, orderPrice, stopPrice }:
        {
            side: OrderSide_LT,
            orderType: FuturesOrderType_LT,
            orderQuantity: string,
            orderPrice: string,
            stopPrice: string
        }) => {
        const args: NewFuturesOrderBase = {
            symbol: this.currentSymbol,
            side: side,
            type: orderType
        }

        let orderArgs: NewFuturesOrder

        switch (orderType) {
            case 'LIMIT':
                orderArgs = {
                    ...args,
                    type: 'LIMIT',
                    timeInForce: 'GTC',
                    quantity: orderQuantity,
                    price: orderPrice,
                };
                break;

            case 'MARKET':
                orderArgs = {
                    ...args,
                    type: 'MARKET',
                    quantity: orderQuantity
                };
                break;

            case 'STOP':
                orderArgs = {
                    ...args,
                    type: 'STOP',
                    quantity: orderQuantity,
                    price: orderPrice,
                    stopPrice: stopPrice
                };
                break;

            // Add cases for other order types

            default:
                throw new Error(`Unsupported order type: ${orderType}`)
        }


        await binanceClient.futuresOrder(orderArgs)
    }

    initMarketSocket() {
        this.marketWS = new WebSocket(`${WsBase}/stream`)
        const symbol = this.currentSymbol.toLocaleLowerCase()

        this.marketWS.onopen = () => {
            runInAction(() => {
                this.isMarketConnected = true
            })
            console.log("Market WebSocket Connected")
            // Send the message after the connection is open
            const message = {
                method: "SUBSCRIBE",
                params: [
                    `${symbol}@aggSnap`,
                    `${symbol}@depth10@500ms`,
                    "!ticker@arr",
                    // "!miniTicker@arr",
                    "!markPrice@arr@1s",
                ],
                id: 1,
            }
            const jsonMessage = JSON.stringify(message)
            this.marketWS?.send(jsonMessage)
        }

        this.marketWS.onmessage = (event: WebSocketMessageEvent) => {
            const data = JSON.parse(event.data).data

            if (!data) return

            if (Array.isArray(data)) {
                if (data.length === 0) return
                const checkTypeOf = data[0]

                if ('c' in checkTypeOf) {
                    this.processMiniTickers(data as Ticker[])
                } else {
                    this.processMarkPrices(data as MarkPrice[])
                }
            } else {
                const eventType = data.e
                switch (eventType) {
                    case 'aggSnap':
                        this.processAggSnap(data)
                        break
                    case 'depthUpdate':
                        this.processDepthUpdate(data)
                        break
                    default:
                        console.error('Unknown event type:', eventType)
                }
            }
        }

        this.marketWS.onerror = (error) => {
            console.log('Market WebSocket error:', error)
            this.initMarketSocket()
        }

        this.marketWS.onclose = () => {
            console.log("Market WebSocket Closed")
            runInAction(() => {
                this.isMarketConnected = false
            })
        }
    }

    private processMiniTickers(data: Ticker[]) {
        const newMap = new Map<string, Ticker>([...this.symbolTicker])

        for (let ticker of data) {
            newMap.set(ticker.s, ticker)
        }
        runInAction(() => {
            this.symbolTicker = newMap
        })
    }

    private processMarkPrices(data: MarkPrice[]) {
        const newMap = new Map<string, MarkPrice>()
        for (let symbol of data) {
            newMap.set(symbol.s, symbol)
        }
        runInAction(() => {
            this.symbolMarkPrice = newMap
        })
    }

    private processAggSnap(data: any) {
        runInAction(() => {
            this.tradeHistory = [data, ...this.tradeHistory.slice(0, 9)]
        })
    }

    private processDepthUpdate(data: any) {
        const { a, b } = data
        runInAction(() => {
            this.orderBook = { a, b, loaded: true }
        })
    }


    async initUserSocker() {
        const listenKey = await this.getListenKey()
        this.userWS = new WebSocket(`${WsBase}/ws/${listenKey}`)

        this.userWS.onopen = () => {
            console.log("User WebSocket Connected")
        }

        this.userWS.onmessage = (event: WebSocketMessageEvent) => {
            // this.loadAll()
            this.loadAllFromBinance()
        }

        const interval = setInterval(() => {
            // this.keepAliveListenKey()
        }, 1500000) // 25 Mins

        this.userWS.onerror = (error) => {
            console.log('User WebSocket error:', error)
            this.initUserSocker()
        }

        this.userWS.onclose = () => {
            console.log("User WebSocket Closed")
            clearInterval(interval)
        }
    }

    private getListenKey = async () => {
        try {
            const endpoint = "https://testnet.binancefuture.com/fapi/v1/listenKey"
            const res = await axios.post(endpoint, {}, {
                headers: {
                    'X-MBX-APIKEY': '0410e1783cfcbbf8d79ce965a7a6a276a91e8a9d1c52cc000cdd1c283a4a485c'
                }
            })
            // const res = await client.post(endpoints.listenKey)
            return res.data.listenKey
        } catch (error) {
            console.error(error)
        }
    }

    private keepAliveListenKey = async () => {
        try {
            const res = await client.put(endpoints.listenKey)
            return res.data.listenKey
        } catch (error) {
            console.error(error)
        }
    }

    clean() {
        console.log("Clean was called")

        this.marketWS?.close()
        this.userWS?.close()
        this.marketWS = null
        this.userWS = null
    }
}

const futuresTradeStore = FuturesTradeStore.getInstance()
export default futuresTradeStore