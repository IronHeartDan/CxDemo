import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import futuresTradeStore from '../stores/FuturesTradeStore'
import moment from 'moment'
import { observer } from 'mobx-react'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

const TradeHistory = observer(() => {

    const RenderTradeListItem = (trade: any, index: number) => {

        const price = parseFloat(trade.p ?? trade.price)
        var quantity = parseFloat(trade.q ?? trade.cq ?? trade.quantity)
        const timeStamp = moment.unix(trade.T ?? trade.timestamp / 1000).local(true).format('HH:mm:ss')

        let tempColor;

        if (!trade.cq) {
            const previousPrice = index > 0 ? parseFloat(futuresTradeStore.tradeHistory[index - 1].p) : price
            tempColor = price > previousPrice ? 'green' : 'red'
        } else {
            tempColor = quantity < 0 ? 'green' : 'red'
            quantity *= quantity < 0 ? -1 : 1
        }

        const color = tempColor

        return (
            <View style={styles.tradeRow} key={index}>
                <View style={styles.tradeCell}>
                    <Text style={{
                        textAlign: 'left',
                        color: color,
                    }}>{price}</Text>
                </View>
                <View style={styles.tradeCell}>
                    <Text style={styles.tradeCellText}>{quantity}</Text>
                </View>
                <View style={styles.tradeCell}>
                    <Text style={styles.tradeCellText}>{timeStamp}</Text>
                </View>
            </View>
        )
    }

    if (futuresTradeStore.tradeHistory.length === 0) {
        return (
            <View>
                {Array.from({ length: 10 }).map((_item, index) => (
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

    return (
        <View style={styles.tradeHistory}>
            <Text style={{ color: 'white', fontSize: 18 }}>Trades</Text>
            <View style={styles.tradeHeader}>
                <View style={styles.headerItem}>
                    <Text style={{
                        ...styles.headerItemText,
                        fontWeight: 'bold',
                        textAlign: 'left',
                    }}>Price</Text>
                </View>
                <View style={styles.headerItem}>
                    <Text style={styles.headerItemText}>Amount</Text>
                </View>
                <View style={styles.headerItem}>
                    <Text style={styles.headerItemText}>Time</Text>
                </View>
            </View>
            {futuresTradeStore.tradeHistory.map((trade, index) => RenderTradeListItem(trade, index))}
        </View>
    )
})

export default TradeHistory

const styles = StyleSheet.create({
    tradeHistory: {
        pointerEvents: 'box-none',
        width: '100%',
        backgroundColor: '#161A1E',
    },
    tradeHeader: {
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
    tradeRow: {
        display: 'flex',
        flexDirection: 'row',
        position: 'relative',
    },
    tradeCell: {
        flex: 1,
        padding: 2,
    },
    tradeCellText: {
        textAlign: 'right',
        color: 'rgba(255, 255, 255, 0.5)',
    },
})