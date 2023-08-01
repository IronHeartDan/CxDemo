import { View, Text, FlatList, StyleSheet, DimensionValue } from 'react-native'
import React, { useEffect, useState } from 'react'
import binanceClient from '../utils/BinanceClient'


type Depth = {
    price: string;
    quantity: string;
    sumInBTC: number;
    percentage: number;
}

type OrderBook = {
    bidDepth: Depth[];
    askDepth: Depth[];
}
const symbol = 'BTCUSDT';

const OrderBook = () => {

    const [orderBook, setOrderBook] = useState<OrderBook>({ askDepth: [], bidDepth: [] })
    const [currentSymbolStatus, setCurrentSymbolStatus] = useState<any>(null)

    useEffect(() => {
        const closePrice = binanceClient.ws.futuresAggTrades(symbol, (trade: any) => {
            setCurrentSymbolStatus(trade)
        })

        const closeOrderBook = binanceClient.ws.futuresPartialDepth({ symbol: symbol, level: 10 }, (depth: any) => {

            if (currentSymbolStatus) {
                let cumulativeSumBids = 0;
                const totalBidsVolume = depth.bidDepth.reduce((sum: any, bid: any) => sum + parseFloat(bid.quantity), 0);
                const bidDepth = depth.bidDepth.map((bid: any) => {
                    const priceInBTC = parseFloat(bid.price) / parseFloat(currentSymbolStatus.price);
                    cumulativeSumBids += priceInBTC * parseFloat(bid.quantity);
                    bid.sumInBTC = cumulativeSumBids;

                    // Calculate the percentage for the depth bar
                    bid.percentage = (parseFloat(bid.quantity) / totalBidsVolume) * 100;
                    return bid;
                });


                let cumulativeSumAsks = 0;
                const totalAsksVolume = depth.askDepth.reduce((sum: any, bid: any) => sum + parseFloat(bid.quantity), 0);
                const askDepth = depth.askDepth.map((ask: any) => {
                    const priceInBTC = parseFloat(ask.price) / parseFloat(currentSymbolStatus.price);
                    cumulativeSumAsks += priceInBTC * parseFloat(ask.quantity);
                    ask.sumInBTC = cumulativeSumAsks;

                    // Calculate the percentage for the depth bar
                    ask.percentage = (parseFloat(ask.quantity) / totalAsksVolume) * 100;
                    return ask;
                });

                const _orderBook: OrderBook = {
                    askDepth: askDepth.reverse(),
                    bidDepth: bidDepth,
                }

                console.log("OrderBook")

                setOrderBook(_orderBook)
            }
        })

        return () => {
            closePrice()
            closeOrderBook()
            console.log("Closed")
        }
    }, [])

    const AskDepthItem = ({ item }: { item: Depth }) => {
        const calc = Number.parseFloat((item.percentage * -1).toFixed(2))
        const right: DimensionValue = `${calc}%`
        return (
            <View style={styles.row}>
                {/* <View style={{ ...styles.bar, right: right }}></View> */}
                <Text style={{ ...styles.cell, color: 'red', textAlign: 'left' }}>{item.price}</Text>
                <Text style={{ ...styles.cell, color: 'red' }}>{item.quantity}</Text>
                <Text style={{ ...styles.cell, color: 'red' }}>{item.sumInBTC.toFixed(3)}</Text>
            </View>
        )
    }


    const BidDepthItem = ({ item }: { item: Depth }) => {
        const calc = Number.parseFloat((item.percentage * -1).toFixed(2))
        const right: DimensionValue = `${calc}%`
        return (
            <View style={styles.row}>
                {/* <View style={{ ...styles.bar, right: right, backgroundColor: 'rgba(14, 203, 129,0.3)', }}></View> */}
                <Text style={{ ...styles.cell, color: 'rgb(14, 203, 129)', textAlign: 'left' }}>{item.price}</Text>
                <Text style={{ ...styles.cell, color: 'rgb(14, 203, 129)' }}>{item.quantity}</Text>
                <Text style={{ ...styles.cell, color: 'rgb(14, 203, 129)' }}>{item.sumInBTC.toFixed(3)}</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={{ ...styles.row, marginBottom: 10 }}>
                <Text style={{ ...styles.headerCell, textAlign: 'left' }}>Price(BTC)</Text>
                <Text style={{ ...styles.headerCell, textAlign: 'right' }}>Size(BTC)</Text>
                <Text style={{ ...styles.headerCell, textAlign: 'right' }}>Sum(BTC)</Text>
            </View>


            {orderBook.askDepth.map((item, index) => (
                <AskDepthItem item={item} key={index} />
            ))}

            <View style={{ marginVertical: 10, width: '100%' }}>
                {currentSymbolStatus && <Text style={styles.currentPrice}>{currentSymbolStatus.price}</Text>}
            </View>

            {orderBook.bidDepth.map((item, index) => (
                <BidDepthItem item={item} key={index} />
            ))}

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 250,
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: 'rgb(22, 26, 30)'
    },
    currentPrice: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white'
    },
    row: {
        position: 'relative',
        flexDirection: 'row',
        // paddingVertical: 2,
    },
    headerCell: {
        flex: 1,
        fontSize: 10,
        fontWeight: 'bold',
        color: 'white'
    },
    cell: {
        flex: 1,
        fontSize: 12,
        textAlign: 'right'
    },
    bar: {
        position: "absolute",
        top: 0,
        bottom: 0,
        width: "100%",
        backgroundColor: 'rgba(255,0,0,0.3)',
    }
});

export default OrderBook