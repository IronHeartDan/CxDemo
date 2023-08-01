import { View, Text, useWindowDimensions } from 'react-native'
import React from 'react'
import { observer } from 'mobx-react'
import futuresTradeStore from '../../stores/FuturesTradeStore'
import { StreamPosition, Position } from '../../types/BinanceTypes'
import { Tabs } from 'react-native-collapsible-tab-view'


const PositionsList = observer(() => {

    const size = useWindowDimensions()

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

        

        return (
            <View key={item.s} style={{
                margin: 10,
                padding: 10,
                backgroundColor: '#161A1E',
                elevation: 2,
                borderRadius: 10
            }}>
                <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 24, marginBottom: 10 }}>{symbol}</Text>
                <Text style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Leverage : {leverage}x</Text>
                <Text style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Entry Price : {Number(entryPrice).toFixed(2)}</Text>
                <Text style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Size : {positionAmount}</Text>
                {/* {futuresTradeStore.markPrice && <Text style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    PNL : {Number(futuresTradeStore.markPrice.p) - Number(entryPrice)}
                </Text>} */}
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

export default PositionsList