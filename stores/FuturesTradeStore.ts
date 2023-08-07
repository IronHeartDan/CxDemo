import axios from "axios"
import { makeAutoObservable, runInAction } from "mobx"
import { Ticker, MarkPrice, StreamOrder, StreamPosition, TradeData, StreamTradeData, AccountInfo, Position, MarketSymbol, MiniTicker } from "../types/BinanceTypes"
import { client } from "../utils/ApiManage"
import binanceClient from "../utils/BinanceClient"
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
    orders: StreamOrder[] = []
    positions: Position[] = []


    // Market Info
    isMarketConnected = false
    currentSymbol = 'BTCUSDT'
    exchangeInfo: any | null = null
    marketSymbols: MarketSymbol[] = []
    private marketWS: WebSocket | null = null
    private userWS: WebSocket | null = null
    tradeHistory: any[] = []
    orderBook = { a: [], b: [], loaded: false }
    symbolTicker: Map<string, MiniTicker> = new Map()
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
        const resOrders: StreamOrder[] = [...res.data]
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
            this.marketSymbols = exchangeInfo.symbols.filter((s: MarketSymbol) => s.status === 'TRADING' && s.contractType === 'PERPETUAL')
            this.orderBook = { a: orderBook.a, b: orderBook.b, loaded: true }
            this.totalWalletBalance = parseFloat(accInfo.totalWalletBalance)
            this.totalMarginBalance = parseFloat(accInfo.totalMarginBalance)
            this.totalPNL = parseFloat(accInfo.totalUnrealizedProfit)
            this.tradeHistory = trades.reverse()
            this.orders = orders
            this.positions = openPositions
        })
    }


    async placeOrder(
        side: string,
        orderType: "LIMIT" | "MARKET" | "STOP" | string,
        orderSize: number,
        orderPrice?: number,
        stopPrice?: number
    ) {
        const orderParams: any = {
            symbol: this.currentSymbol,
            side,
            quantity: orderSize,
            type: orderType,
        }

        if (orderType === "LIMIT" || orderType === "STOP") {
            orderParams.price = orderPrice
        }

        if (orderType === "LIMIT") {
            orderParams.timeInForce = "GTC"
        }

        if (orderType === "STOP") {
            orderParams.stopPrice = stopPrice
        }

        await binanceClient.futuresOrder(orderParams)
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
                    "!miniTicker@arr",
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
                    this.processMiniTickers(data as MiniTicker[])
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

    private processMiniTickers(data: MiniTicker[]) {
        const newMap = new Map<string, MiniTicker>([...this.symbolTicker])
        
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