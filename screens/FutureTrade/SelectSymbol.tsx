import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import futuresTradeStore from '../../stores/FuturesTradeStore'
import { TextInput } from 'react-native-paper'
import { observer } from 'mobx-react'
import { MarketSymbol } from '../../types/BinanceTypes'



const SelectSymbol = observer(({ close }: any) => {
    const [searchText, setSearchText] = useState("")
    const [symbols, setSymbols] = useState<MarketSymbol[]>([])

    useEffect(() => {
        setSymbols(futuresTradeStore.marketSymbols)
    }, [futuresTradeStore.marketSymbols])

    useEffect(() => {
        if (searchText.length > 0) {
            const filtered = futuresTradeStore.marketSymbols.filter((s) => s.symbol.toLowerCase().startsWith(searchText))
            setSymbols(filtered)
        } else {
            setSymbols(futuresTradeStore.marketSymbols)
        }
    }, [searchText])

    const SymbolItem = React.memo(({ item, close }: any) => {
        let symbolPrice

        if (futuresTradeStore.symbolMarkPrice.has(item.symbol)) {
            symbolPrice = Number(futuresTradeStore.symbolMarkPrice.get(item.symbol)!.p).toFixed(2)
        }

        const handlePress = useCallback(() => {
            futuresTradeStore.changeCurrentSymbol(item.symbol)
            close()
        }, [item.symbol, close])

        return (
            <TouchableOpacity onPress={handlePress}>
                <View style={{ paddingVertical: 10, paddingHorizontal: 5 }}>
                    <Text style={{ color: 'white', fontSize: 16 }}>{item.symbol}</Text>
                    {symbolPrice && <Text style={{ color: 'green', fontSize: 12, fontWeight: 'bold' }}>{symbolPrice}</Text>}
                </View>
            </TouchableOpacity>
        )
    })

    return (
        <View style={{ flex: 1 }}>
            <TextInput placeholder='Search' style={{ margin: 10, borderRadius: 5, }}
                onChangeText={setSearchText}
            />
            <BottomSheetFlatList
                data={symbols}
                renderItem={({ item, index }: any) => <SymbolItem key={index} item={item} close={close} />}
            />
        </View>
    )
})

export default SelectSymbol

const styles = StyleSheet.create({})
