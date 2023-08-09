import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { TouchableOpacity, BottomSheetFlatList, BottomSheetFlatListMethods } from '@gorhom/bottom-sheet'
import futuresTradeStore from '../../stores/FuturesTradeStore'
import { Searchbar, TextInput } from 'react-native-paper'
import { observer } from 'mobx-react'
import { MarketSymbol } from '../../types/BinanceTypes'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'


const SymbolItem = observer(({ item, close }: any) => {
    let symbolPrice
    let volume
    let percentage
    let icon
    let color

    if (futuresTradeStore.symbolTicker.has(item.symbol)) {
        const symbolTicker = futuresTradeStore.symbolTicker.get(item.symbol)!
        symbolPrice = Number(symbolTicker.c).toFixed(2)
        volume = Number(symbolTicker.q).toFixed(2)
        percentage = Number(symbolTicker.P)
        icon = percentage < 0 ? "arrow-down-drop-circle" : "arrow-up-drop-circle"
        color = percentage < 0 ? "red" : "green"
    }


    return (
        <TouchableOpacity onPress={() => {
            futuresTradeStore.changeCurrentSymbol(item.symbol)
            close()
        }}>
            <View style={{ paddingVertical: 10, paddingHorizontal: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                    <Text style={{ color: 'white', fontSize: 16 }}>{item.symbol}</Text>
                    {symbolPrice && <Text style={{ color: 'green', fontSize: 12, fontWeight: 'bold' }}>{symbolPrice}</Text>}
                    {/* {volume && <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{volume}</Text>} */}
                </View>
                <Text style={{ color: 'white' }}>
                    {percentage && <MaterialCommunityIcons
                        size={20}
                        name={icon!}
                        color={color!}
                    />}
                </Text>
            </View>
        </TouchableOpacity>
    )
})

const SelectSymbol = observer(({ close }: any) => {
    const [searchText, setSearchText] = useState("")
    const [symbols, setSymbols] = useState<MarketSymbol[]>([])

    useEffect(() => {
        setSymbols(Array.from(futuresTradeStore.marketSymbols.values()))
    }, [futuresTradeStore.marketSymbols])

    useEffect(() => {
        const marketSymbols = Array.from(futuresTradeStore.marketSymbols.values())
        if (searchText.length > 0) {
            const filtered = marketSymbols.filter((s) => s.symbol.toLowerCase().startsWith(searchText.toLowerCase()))
            setSymbols(filtered)
        } else {
            setSymbols(marketSymbols)
        }
    }, [searchText])

    return (
        <View style={{ flex: 1 }}>
            <Searchbar
                placeholder="Search"
                style={{ margin: 10, borderRadius: 5, }}
                onChangeText={setSearchText}
                value={searchText}
            />
            <BottomSheetFlatList
                data={symbols}
                renderItem={({ item, index }: any) => <SymbolItem item={item} close={close} />}
                keyExtractor={(item: any, index: any) => `${item.symbol}${index}`}
                initialNumToRender={20}
                nestedScrollEnabled
            />
        </View>
    )
})

export default SelectSymbol

const styles = StyleSheet.create({})
