import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useRef } from 'react'
import futuresTradeStore from '../stores/FuturesTradeStore'
import { observer } from 'mobx-react'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import SelectSymbol from '../screens/FutureTrade/SelectSymbol'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

const SymbolInfo = observer(() => {

    let percentage
    let icon
    let color

    if (futuresTradeStore.symbolTicker.has(futuresTradeStore.currentSymbol)) {
        const symbolTicker = futuresTradeStore.symbolTicker.get(futuresTradeStore.currentSymbol)!
        percentage = Number(symbolTicker.P)
        icon = percentage < 0 ? "arrow-down-drop-circle" : "arrow-up-drop-circle"
        color = percentage < 0 ? "red" : "green"
    }

    return (
        <View style={{ maxWidth: 'auto' }}>
            <Text style={{ fontSize: 24, color: 'white' }}>{futuresTradeStore.currentSymbol}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {futuresTradeStore.symbolTicker.has(futuresTradeStore.currentSymbol) && <Text style={{ color: color ?? 'white' }}>
                    {futuresTradeStore.symbolTicker.get(futuresTradeStore.currentSymbol)?.c.slice(0, 10)}
                </Text>}
                {percentage && <MaterialCommunityIcons
                    style={{
                        marginStart: 10
                    }}
                    size={20}
                    name={icon!}
                    color={color!}
                />}
            </View>
        </View>
    )
})

export default SymbolInfo

const styles = StyleSheet.create({})