import { View, Text, useWindowDimensions, StyleSheet } from 'react-native'
import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import futuresTradeStore from '../../stores/FuturesTradeStore'
import { StreamPosition, Position } from '../../types/BinanceTypes'
import { Tabs } from 'react-native-collapsible-tab-view'
import { Button } from 'react-native-paper'


const PositionsList = observer(() => {

    const size = useWindowDimensions()

    useEffect(() => {
        // This will force the component to re-render on changes to the observed data
    }, [futuresTradeStore.symbolMarkPrice])

    const renderemptyPositions = () => {
        return (
            <View style={{ height: size.height, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'rgba(255, 255, 255, 0.5)' }}>You have no open positions.</Text>
            </View>
        )
    }

    const renderPosition = ({ item }: { item: StreamPosition | Position | any }) => {

        const symbol = item.symbol ?? item.s
        const positionAmount = item.positionAmt ?? item.pa
        const entryPrice = item.entryPrice ?? item.ep
        const leverage = item.leverage ?? 0
        const margin = item.initialMargin
        let pnl;
        let marketPrice = 0

        if (futuresTradeStore.symbolMarkPrice.has(symbol)) {
            marketPrice = Number(futuresTradeStore.symbolMarkPrice.get(symbol)!.p);
            pnl = Number(((marketPrice - Number(entryPrice)) * positionAmount).toFixed(2));
        } else {
            pnl = 0;
        }

        return (
            <View key={item.s} style={style.card}>
                <View style={style.row}>
                    <Text style={style.symbol}>{symbol}</Text>
                    <View style={style.cell}>
                        <Text style={style.item}>{leverage}x</Text>
                    </View>
                </View>
                <View style={style.row}>
                    <View style={style.cell}>
                        <Text style={style.title}>Mark Price</Text>
                        <Text style={style.item}>{marketPrice.toFixed(2)}</Text>
                    </View>
                    <View style={style.cell}>
                        <Text style={style.title}>Entry Price</Text>
                        <Text style={style.item}>{Number(entryPrice).toFixed(2)}</Text>
                    </View>
                    <View style={style.cell}>
                        <Text style={style.title}>Size</Text>
                        <Text style={style.item}>{positionAmount}</Text>
                    </View>
                </View>
                <View style={style.row}>
                    <View style={style.cell}>
                        <Text style={style.title}>PNL</Text>
                        <Text style={{ color: pnl < 0 ? 'red' : pnl > 0 ? 'green' : 'rgba(255, 255, 255, 0.5)' }}>{pnl}</Text>
                    </View>
                </View>
                <View style={{ ...style.row, marginVertical: 10, }}>
                    <Button style={{ flex: 1, marginHorizontal: 5, backgroundColor: 'lightblue', }} onPress={() => { }}>
                        <Text style={{ color: 'black' }}>Stop PNL</Text>
                    </Button>
                    <Button style={{ flex: 1, marginHorizontal: 5, backgroundColor: 'lightblue', }} onPress={() => { }}>
                        <Text style={{ color: 'black' }}>Close</Text>
                    </Button>
                </View>
            </View>
        )
    }

    return (
        <Tabs.FlatList
            data={futuresTradeStore.positions}
            renderItem={renderPosition}
            ListEmptyComponent={renderemptyPositions}
        />
    )
})

const style = StyleSheet.create({
    card: {
        margin: 10,
        padding: 5,
        backgroundColor: 'black',
        elevation: 2,
        borderRadius: 10
    },
    symbol: {
        // color: 'rgba(255, 255, 255, 0.5)',
        color: 'white',
        fontSize: 24,
        marginBottom: 10
    },
    row: {
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    cell: {
        paddingVertical: 5
    },
    title: {
        // color: 'rgba(255, 255, 255, 0.5)',
        color: 'white',
        fontSize: 12
    },
    item: {
        // color: 'rgba(255, 255, 255, 0.5)',
        color: 'white',
        fontSize: 16
    }
})

export default PositionsList