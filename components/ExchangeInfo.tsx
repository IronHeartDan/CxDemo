import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useRef } from 'react'
import futuresTradeStore from '../stores/FuturesTradeStore'
import { observer } from 'mobx-react'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import SelectSymbol from '../screens/FutureTrade/SelectSymbol'

const ExchangeInfo = observer(() => {
    const selectSymbolSheetRef = useRef<BottomSheetModal | null>(null)

    const close = () => {
        selectSymbolSheetRef.current?.close()
    }

    return (<>
        <TouchableOpacity onPress={() => {
            selectSymbolSheetRef.current?.present()
        }}>
            <Text style={{ fontSize: 24, color: 'white' }}>{futuresTradeStore.currentSymbol}</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row' }}>
            <Text style={{ fontWeight: 'bold', color: 'green' }}>Live </Text>
            {futuresTradeStore.symbolTicker.has(futuresTradeStore.currentSymbol) && <Text style={{ color: 'white' }}>
                {futuresTradeStore.symbolTicker.get(futuresTradeStore.currentSymbol)?.c.slice(0, 10)}
            </Text>}
        </View>
        <BottomSheetModal
            ref={selectSymbolSheetRef}
            index={0}
            enablePanDownToClose
            snapPoints={['100%']}
            backgroundStyle={{
                backgroundColor: '#161A1E',
            }}
            handleIndicatorStyle={{
                backgroundColor: 'white'
            }}>
            <SelectSymbol close={close} />
        </BottomSheetModal>
    </>
    )
})

export default ExchangeInfo

const styles = StyleSheet.create({})