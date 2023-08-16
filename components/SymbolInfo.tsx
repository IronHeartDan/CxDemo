import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useState, useCallback, useRef } from 'react'
import futuresTradeStore from '../stores/FuturesTradeStore'
import { observer } from 'mobx-react'
import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet'
import SelectSymbol from '../screens/FutureTrade/SelectSymbol'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { Modal, Portal } from 'react-native-paper'
import HandleLeverage from '../screens/FutureTrade/HandleLeverage'

const SymbolInfo = observer(() => {

    const selectSymbolSheetRef = useRef<BottomSheetModal | null>(null)
    const changeSymbolLeverageSheetRef = useRef<BottomSheetModal | null>(null)

    let percentage
    let icon
    let color

    if (futuresTradeStore.symbolTicker.has(futuresTradeStore.currentSymbol)) {
        const symbolTicker = futuresTradeStore.symbolTicker.get(futuresTradeStore.currentSymbol)!
        percentage = Number(symbolTicker.P)
        icon = percentage < 0 ? "arrow-down-drop-circle" : "arrow-up-drop-circle"
        color = percentage < 0 ? "red" : "green"
    }

    const renderBackdrop = useCallback((props: any) => (
        <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
        />
    ), [])

    return (
        <>
            <View style={{ padding: 10, maxWidth: 'auto', flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgb(22, 26, 30)', }}>
                <View>
                    <TouchableOpacity onPress={() => selectSymbolSheetRef.current?.present()}>
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
                    </TouchableOpacity>
                </View>
                <View>
                    <TouchableOpacity onPress={() => changeSymbolLeverageSheetRef.current?.present()}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ color: 'white' }}>{futuresTradeStore.currentLeverage}X</Text>
                            <MaterialCommunityIcons
                                style={{
                                    marginStart: 10
                                }}
                                size={20}
                                name="circle-edit-outline"
                                color="white"
                            />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            <BottomSheetModal
                ref={selectSymbolSheetRef}
                index={0}
                backdropComponent={renderBackdrop}
                enablePanDownToClose
                snapPoints={['100%']}
                backgroundStyle={{
                    backgroundColor: '#161A1E',
                }}
                handleIndicatorStyle={{
                    backgroundColor: 'white'
                }}>
                <SelectSymbol close={() => selectSymbolSheetRef.current?.close()} />
            </BottomSheetModal>
            <BottomSheetModal
                ref={changeSymbolLeverageSheetRef}
                index={0}
                backdropComponent={renderBackdrop}
                enablePanDownToClose
                snapPoints={['50%']}
                backgroundStyle={{
                    backgroundColor: '#161A1E',
                }}
                handleIndicatorStyle={{
                    backgroundColor: 'white'
                }}>
                <HandleLeverage close={() => changeSymbolLeverageSheetRef.current?.close()} />
            </BottomSheetModal>
        </>
    )
})

export default SymbolInfo

const styles = StyleSheet.create({})