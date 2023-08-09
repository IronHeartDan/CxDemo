import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useRef } from 'react'
import futuresTradeStore from '../stores/FuturesTradeStore'
import { observer } from 'mobx-react'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import SelectSymbol from '../screens/FutureTrade/SelectSymbol'

const ExchangeInfo = observer(() => {
    return (
        <View style={{ maxWidth: 'auto' }}>
            <Text style={{ fontSize: 24, color: 'white' }}>{futuresTradeStore.currentSymbol}</Text>
            <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontWeight: 'bold', color: 'green' }}>Live </Text>
                {futuresTradeStore.symbolTicker.has(futuresTradeStore.currentSymbol) && <Text style={{ color: 'white' }}>
                    {futuresTradeStore.symbolTicker.get(futuresTradeStore.currentSymbol)?.c.slice(0, 10)}
                </Text>}
            </View>
        </View>
    )
})

export default ExchangeInfo

const styles = StyleSheet.create({})