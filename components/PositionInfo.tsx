import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { observer } from 'mobx-react'
import futuresTradeStore from '../stores/FuturesTradeStore'
import { Position } from '../types/BinanceTypes'

const PositionInfo = observer(({ position }: { position: Position }) => {
    const symbol = position.symbol
    const leverage = Number(position.leverage)
    const positionAmount = Number(position.positionAmt)
    const entryPrice = Number(position.entryPrice)
    const initialEquity = entryPrice * positionAmount / leverage
    let pnl;
    let marketPrice = 0
    let baseAsset = ''
    let quoteAsset = ''

    if (futuresTradeStore.symbolMarkPrice.has(symbol)) {
        marketPrice = Number(futuresTradeStore.symbolMarkPrice.get(symbol)!.p);
        pnl = Number(((marketPrice - entryPrice) * positionAmount).toFixed(2));
    } else {
        pnl = 0;
    }

    const roe = Number(((pnl / initialEquity) * 100).toFixed(2))

    if (futuresTradeStore.marketSymbols.has(symbol)) {
        const marketSymbol = futuresTradeStore.marketSymbols.get(symbol)!
        baseAsset = marketSymbol.baseAsset
        quoteAsset = marketSymbol.quoteAsset
    }
    return (
        <View style={styles.container}>
            <View style={{ ...styles.cell, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.symbol}>{position.symbol}</Text>
                <Text style={styles.symbol}>{leverage}X</Text>
            </View>
            <View style={{ ...styles.cell, flexDirection: 'row', justifyContent: 'space-between' }}>
                <View>
                    <Text style={styles.title}>Entry Price</Text>
                    <Text style={styles.item}>{entryPrice.toFixed(2)}</Text>
                </View>
                <View>
                    <Text style={{ ...styles.title, textAlign: 'right' }}>Mark Price</Text>
                    <Text style={{ ...styles.item, textAlign: 'right' }}>{marketPrice.toFixed(2)}</Text>
                </View>
                <View>
                    <Text style={{ textAlign: 'right', color: pnl < 0 ? 'red' : pnl > 0 ? 'green' : 'rgba(255, 255, 255, 0.5)', }}>{pnl}</Text>
                    <Text style={{ textAlign: 'right', color: roe < 0 ? 'red' : roe > 0 ? 'green' : 'rgba(255, 255, 255, 0.5)', }}>({roe}%)</Text>
                </View>
            </View>
        </View>
    )
})

export default PositionInfo

const styles = StyleSheet.create({
    container: {
        padding: 10
    },
    symbol: {
        color: "white",
        fontSize: 24,
    },
    cell: {
        marginVertical: 5
    },
    title: {
        color: 'white',
        fontSize: 14
    },
    item: {
        color: 'white',
        fontSize: 16
    },
})