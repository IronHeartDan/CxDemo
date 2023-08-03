import axios from "axios";
import { makeAutoObservable, runInAction } from "mobx"
import { Ticker, MarkPrice, StreamOrder, StreamPosition, TradeData, StreamTradeData, AccountInfo, Position } from "../types/BinanceTypes";
import { client } from "../utils/ApiManage";
import binanceClient from "../utils/BinanceClient";
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
    orders: StreamOrder[] = [];
    positions: Position[] = [];


    // Market Info
    currentSymbol = 'BTCUSDT'
    isMarketConnected = false
    private marketWS: WebSocket | null = null
    private userWS: WebSocket | null = null
    tradeHistory: any[] = []
    orderBook = { a: [], b: [], loaded: false }
    symbolTicker: Ticker | null = null
    symbolMarkPrice: Map<string, MarkPrice> = new Map()

    private static instance: FuturesTradeStore | null = null;

    static getInstance(): FuturesTradeStore {
        if (!FuturesTradeStore.instance) {
            FuturesTradeStore.instance = new FuturesTradeStore();
        }

        return FuturesTradeStore.instance;
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

    loadAll = () => {
        this.fetchOrders()
        this.fetchPositions()
    }


    fetchTradeHistory = async () => {
        const res = await client.get(endpoints.tradeHistory)
        const tradeHistory = [...res.data]
        runInAction(() => {
            this.tradeHistory = tradeHistory
        })
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
        const symbol = 'BTCUSDT'
        const trades = await binanceClient.futuresAggTrades({ symbol: symbol, limit: 10 })
        const accInfo: AccountInfo = await binanceClient.futuresAccountInfo()
        const orders = await binanceClient.futuresOpenOrders({
            symbol: symbol
        });
        // const positions = await binanceClient.futuresPositionRisk()
        const openPositions = accInfo.positions.filter((position) => parseFloat(position.positionAmt) !== 0)
        runInAction(() => {
            this.totalWalletBalance = parseFloat(accInfo.totalWalletBalance)
            this.totalMarginBalance = parseFloat(accInfo.totalMarginBalance)
            this.totalPNL = parseFloat(accInfo.totalUnrealizedProfit)
            this.tradeHistory = trades.reverse()
            this.orders = orders
            this.positions = openPositions
        })
    }

    initMarketSocket() {
        this.marketWS = new WebSocket(`${WsBase}/stream`)

        this.marketWS.onopen = () => {
            runInAction(() => {
                this.isMarketConnected = true
            })
            console.log("Market WebSocket Connected")
            // Send the message after the connection is open
            const message = {
                method: "SUBSCRIBE",
                params: [
                    "btcusdt@aggSnap",
                    "btcusdt@ticker",
                    // "btcusdt@markPrice",
                    "!markPrice@arr@1s",
                    "btcusdt@depth10@500ms",
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

                const newMap = new Map<string, MarkPrice>();
                for (let symbol of data as MarkPrice[]) {
                    newMap.set(symbol.s, symbol)
                }
                runInAction(() => {
                    this.symbolMarkPrice = newMap
                })

            } else {

                if (data.e === 'aggSnap') {
                    runInAction(() => {
                        if (this.tradeHistory.length < 10) {
                            this.tradeHistory = [data, ...this.tradeHistory]
                        } else {
                            this.tradeHistory.pop()
                            this.tradeHistory = [data, ...this.tradeHistory]
                        }
                    })
                }

                // if (data.e === 'markPriceUpdate') {
                //     runInAction(() => {
                //         this.symbolMarkPrice = data
                //     })
                // }

                if (data.e === 'depthUpdate') {
                    runInAction(() => {
                        const { a, b } = data
                        this.orderBook = { a: a, b: b, loaded: true }
                    })
                }

                if (data.e === '24hrTicker') {
                    runInAction(() => {
                        this.symbolTicker = data
                    })
                }
            }
        }

        this.marketWS.onerror = (error) => {
            console.log('Market WebSocket error:', error)
            this.initMarketSocket()
        };

        this.marketWS.onclose = () => {
            console.log("Market WebSocket Closed")
            runInAction(() => {
                this.isMarketConnected = false
            })
        }
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
        };

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
        console.log("Clean was called");

        this.marketWS?.close()
        this.userWS?.close()
        this.marketWS = null
        this.userWS = null
    }
}

const futuresTradeStore = FuturesTradeStore.getInstance()
export default futuresTradeStore