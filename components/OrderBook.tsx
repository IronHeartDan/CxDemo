import React, { useCallback, useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import { View, Text, StyleSheet } from 'react-native'
import futuresTradeStore from '../stores/FuturesTradeStore'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'


const OrderBook = observer(({ horizontal = false }) => {
    const [orderBookData, setOrderBookData] = useState({
        asks: [],
        bids: [],
    })

    useEffect(() => {
        setOrderBookData({
            asks: calcSum(futuresTradeStore.orderBook.a, true),
            bids: calcSum(futuresTradeStore.orderBook.b),
        })
    }, [futuresTradeStore.orderBook])

    const calcSum = (data: any, isAsk = false): [] => {
        if (futuresTradeStore.symbolTicker == null || futuresTradeStore.symbolTicker!.c.length === 0) return data.slice(0, 8)

        let cumulativeSum = 0
        const totalVolume = data.reduce((sum: any, item: any) => sum + parseFloat(item[1]), 0)

        const dataWithSum = data.slice(0, 8).map((item: any) => {
            const priceInBTC = parseFloat(item[0]) / parseFloat(futuresTradeStore.symbolTicker!.c)
            const sizeInBTC = parseFloat(item[1])
            cumulativeSum += priceInBTC * sizeInBTC
            const percentage = (cumulativeSum / totalVolume) * 100
            return [item[0], item[1], cumulativeSum.toFixed(3), 100 - percentage]
        })

        if (isAsk) {
            return dataWithSum.reverse()
        }

        return dataWithSum
    }

    if (!futuresTradeStore.orderBook.loaded) {
        return (
            <View>
                {Array.from({ length: 10 }).map((item, index) => (
                    <SkeletonPlaceholder
                        key={index}
                        backgroundColor='rgba(255, 255, 255, 0.5)'
                        highlightColor='#e8e8e8'
                    >
                        <View style={{ backgroundColor: '#e8e8e8', width: '100%', height: 10, marginVertical: 10 }} />
                    </SkeletonPlaceholder >
                ))}
            </View>
        )
    }

    if (!horizontal)
        return (
            <View style={styles.orderBook}>
                <Text style={{ color: 'white', fontSize: 18 }}>Order Book</Text>
                <View style={styles.orderBookHeader}>
                    <View style={styles.headerItem}>
                        <Text style={{
                            ...styles.headerItemText,
                            fontWeight: 'bold',
                            textAlign: 'left',
                        }}>Price</Text>
                    </View>
                    <View style={styles.headerItem}>
                        <Text style={styles.headerItemText}>Size</Text>
                    </View>
                    <View style={styles.headerItem}>
                        <Text style={styles.headerItemText}>Sum</Text>
                    </View>
                </View>
                <View>
                    {orderBookData.asks.map((ask, index) => (
                        <View style={styles.orderBookRow} key={index}>
                            {ask[3] && <View style={[styles.depthBar, styles.askBar, { left: `${ask[3]}%` }]} />}
                            <View style={styles.orderBookCell}>
                                <Text style={{
                                    textAlign: 'left',
                                    color: '#f6465d',
                                }}>{ask[0]}</Text>
                            </View>
                            <View style={styles.orderBookCell}>
                                <Text style={styles.orderBookCellText}>{ask[1]}</Text>
                            </View>
                            <View style={styles.orderBookCell}>
                                <Text style={styles.orderBookCellText}>{ask[2]}</Text>
                            </View>
                        </View>
                    ))}
                </View>
                <View style={styles.symbolPrice}>
                    <Text style={styles.symbolPriceText}>{futuresTradeStore.symbolTicker?.c.slice(0, 10)}</Text>
                </View>
                <View>
                    {orderBookData.bids.map((bid, index) => (
                        <View style={styles.orderBookRow} key={index}>
                            {bid[3] && <View style={[styles.depthBar, styles.bidBar, { left: `${bid[3]}%` }]} />}
                            <View style={styles.orderBookCell}>
                                <Text style={{
                                    textAlign: 'left',
                                    color: '#0ecb81',
                                }}>{bid[0]}</Text>
                            </View>
                            <View style={styles.orderBookCell}>
                                <Text style={styles.orderBookCellText}>{bid[1]}</Text>
                            </View>
                            <View style={styles.orderBookCell}>
                                <Text style={styles.orderBookCellText}>{bid[2]}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        )

    return (
        <View style={{ ...styles.orderBook, flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1, overflow: 'hidden' }}>
                <Text style={{ color: 'white' }}>Asks</Text>
                {orderBookData.asks.map((ask, index) => (
                    <View style={styles.orderBookRow} key={index}>
                        {ask[3] && <View style={[styles.depthBar, styles.askBar, { left: `${ask[3]}%` }]} />}
                        <View style={styles.orderBookCell}>
                            <Text style={{ ...styles.orderBookCellText, textAlign: 'left' }}>{ask[1]}</Text>
                        </View>
                        <View style={styles.orderBookCell}>
                            <Text style={{
                                textAlign: 'right',
                                color: '#f6465d',
                            }}>{ask[0]}</Text>
                        </View>
                    </View>
                ))}
            </View>
            <View style={{ flex: 1, overflow: 'hidden' }}>
                <Text style={{ color: 'white' }}>Bids</Text>
                {orderBookData.bids.map((bid, index) => (
                    <View style={styles.orderBookRow} key={index}>
                        {bid[3] && <View style={[styles.depthBar, styles.bidBar, { left: `${bid[3]}%` }]} />}
                        <View style={styles.orderBookCell}>
                            <Text style={{
                                textAlign: 'left',
                                color: '#0ecb81',
                            }}>{bid[0]}</Text>
                        </View>
                        <View style={styles.orderBookCell}>
                            <Text style={styles.orderBookCellText}>{bid[1]}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    )
})

const styles = StyleSheet.create({
    orderBook: {
        pointerEvents: 'none',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: '#161A1E',
    },
    symbolPrice: {
        marginVertical: 5,
    },
    symbolPriceText: {
        fontSize: 24,
        color: 'white',
    },
    orderBookHeader: {
        display: 'flex',
        flexDirection: 'row',
        position: 'relative',
        marginVertical: 5,
    },
    headerItem: {
        flex: 1,
        padding: 2,
    },
    headerItemText: {
        textAlign: 'right',
        color: 'rgba(255, 255, 255, 0.5)',
        fontWeight: 'bold',
    },
    orderBookRow: {
        display: 'flex',
        flexDirection: 'row',
        position: 'relative',
    },
    orderBookCell: {
        flex: 1,
        padding: 2,
    },
    orderBookCellText: {
        textAlign: 'right',
        color: 'rgba(255, 255, 255, 0.5)',
    },
    depthBar: {
        position: 'absolute',
        height: '100%',
        width: '100%',
        left: '100%',
        transitionDuration: 200,
        opacity: 0.1,
    },
    askBar: {
        backgroundColor: 'rgb(246, 70, 93)',
    },
    bidBar: {
        backgroundColor: 'rgb(14, 203, 129)',
    },
})

export default OrderBook