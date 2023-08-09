import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { observer } from 'mobx-react'
import { Position } from '../../types/BinanceTypes'
import { Button, Divider, SegmentedButtons, TextInput } from 'react-native-paper'
import futuresTradeStore from '../../stores/FuturesTradeStore'
import { BottomSheetScrollView } from '@gorhom/bottom-sheet'

const ManagePosition = observer(({ position, close }: { position: Position, close: Function }) => {
    const [type, setValue] = useState('MARKET')
    const [orderPrice, setOrderPrice] = useState('')
    const [orderSize, setOrderSize] = useState('')


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
        <BottomSheetScrollView contentContainerStyle={styles.container}>
            <View style={{ flex: 1 }}>
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
                <Divider style={{ marginVertical: 20 }} />
                <View style={{ alignItems: 'center', }}>
                    <SegmentedButtons
                        style={{
                            width: 300,
                        }}
                        value={type}
                        onValueChange={setValue}
                        buttons={[
                            {
                                value: 'MARKET',
                                label: 'Market',
                                uncheckedColor: 'white'
                            },
                            {
                                value: 'LIMIT',
                                label: 'Limit',
                                uncheckedColor: 'white'
                            },
                        ]}
                    />
                </View>
                <View style={{ marginVertical: 20 }}>
                    <View style={{ marginVertical: 10 }}>
                        <TextInput
                            error={Number(orderSize) > positionAmount}
                            style={{
                                backgroundColor: 'white',
                                borderRadius: 10,
                                borderTopLeftRadius: 10,
                                borderTopRightRadius: 10,
                            }}
                            label={baseAsset}
                            keyboardType='number-pad'
                            onChangeText={setOrderSize}
                            value={orderSize}
                        />
                    </View>
                    <View style={{ marginVertical: 10 }}>
                        <TextInput
                            style={{
                                display: type !== 'LIMIT' ? 'none' : 'flex',
                                backgroundColor: 'white',
                                borderRadius: 10,
                                borderTopLeftRadius: 10,
                                borderTopRightRadius: 10,
                            }}
                            label={quoteAsset}
                            keyboardType='number-pad'
                            onChangeText={setOrderPrice}
                            value={orderPrice}
                        />
                    </View>
                </View>
            </View>
            <View>
                <Button style={{ backgroundColor: 'white', }} onPress={() => { close() }} icon="check">
                    <Text style={{ color: 'black' }}>Confirm</Text>
                </Button>
            </View>
        </BottomSheetScrollView>
    )
})

export default ManagePosition

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        margin: 10,
        padding: 5,
    },
    symbol: {
        color: "white",
        fontSize: 24,
    },
    cell: {
        marginVertical: 5
    },
    title: {
        // color: 'rgba(255, 255, 255, 0.5)',
        color: 'white',
        fontSize: 14
    },
    item: {
        // color: 'rgba(255, 255, 255, 0.5)',
        color: 'white',
        fontSize: 16
    },
})