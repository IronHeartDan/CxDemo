import { StyleSheet, Text, View, TextInput, Keyboard } from 'react-native'
import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import { Position } from '../../types/BinanceTypes'
import { Button, Divider, SegmentedButtons } from 'react-native-paper'
import futuresTradeStore from '../../stores/FuturesTradeStore'
import { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import Snackbar from 'react-native-snackbar'
import { FuturesOrderType_LT, OrderType } from '../../types/FuturesOrderTypes'

const ManagePosition = observer(({ position, close }: { position: Position, close: Function }) => {
    const [orderType, setOrderType] = useState<FuturesOrderType_LT>('MARKET')
    const [orderPrice, setOrderPrice] = useState('')
    const [orderQuantity, setOrderQuantity] = useState('')
    const [isKeyboardVisible, setKeyboardVisibility] = useState(false)


    useEffect(() => {
        Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardVisibility(true)
        })

        Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardVisibility(false)
        })
    }, [])

    const placeOrder = async () => {

        let invalid = false
        switch (orderType) {
            case 'LIMIT':
                invalid = orderPrice.length === 0 || orderQuantity.length === 0
                break;
            case 'MARKET':
                invalid = orderQuantity.length === 0
                break;
            default:
                invalid = false
                break;
        }

        if (invalid) {
            Snackbar.show({
                text: "Invalid Input",
                duration: Snackbar.LENGTH_SHORT,
                backgroundColor: 'white',
                textColor: 'red'
            });
            return;
        }


        try {
            await futuresTradeStore.placeOrder({
                side: 'SELL',
                orderType: orderType,
                orderQuantity: orderQuantity,
                orderPrice: orderPrice,
                stopPrice: ''
            })

            console.log('Order placed')

            if (close) close()
            Snackbar.show({
                text: 'Order Placed',
                duration: Snackbar.LENGTH_SHORT,
                backgroundColor: 'green',
                textColor: 'white'
            })
        } catch (error) {
            console.log(error);
            Snackbar.show({
                text: `${error}`,
                duration: Snackbar.LENGTH_SHORT,
                backgroundColor: 'white',
                textColor: 'red'
            })
        }
    }


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
                        value={orderType}
                        onValueChange={(val) => {
                            setOrderType(val as FuturesOrderType_LT)
                        }}
                        buttons={[
                            {
                                value: OrderType.MARKET,
                                label: 'Market',
                                uncheckedColor: 'white'
                            },
                            {
                                value: OrderType.LIMIT,
                                label: 'Limit',
                                uncheckedColor: 'white'
                            },
                        ]}
                    />
                </View>
                <View style={{ marginVertical: 20 }}>
                    <View style={{
                        ...styles.inputCon,
                        borderColor: Number(orderQuantity) > positionAmount ? 'red' : 'transparent',
                        borderWidth: 2,
                    }}>
                        <Text>Size</Text>
                        <TextInput style={styles.textInput}
                            keyboardType="number-pad"
                            onChangeText={setOrderQuantity}
                            value={orderQuantity}
                            placeholder='0'
                        />
                        {futuresTradeStore.marketSymbols.has(futuresTradeStore.currentSymbol) && <Text>
                            {futuresTradeStore.marketSymbols.get(futuresTradeStore.currentSymbol)!.baseAsset}
                        </Text>}
                    </View>
                    <View style={{ ...styles.inputCon, display: orderType !== 'LIMIT' ? 'none' : 'flex', }}>
                        <Text>Price</Text>
                        <TextInput style={styles.textInput}
                            keyboardType="number-pad"
                            onChangeText={setOrderPrice}
                            value={orderPrice}
                            placeholder='0'
                        />
                        {futuresTradeStore.marketSymbols.has(futuresTradeStore.currentSymbol) && <Text>
                            {futuresTradeStore.marketSymbols.get(futuresTradeStore.currentSymbol)!.quoteAsset}
                        </Text>}
                    </View>
                </View>
            </View>
            {!isKeyboardVisible && <View>
                <Button style={{ backgroundColor: 'white', }} onPress={placeOrder} icon="check">
                    <Text style={{ color: 'black' }}>Confirm</Text>
                </Button>
            </View>}
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
        color: 'white',
        fontSize: 14
    },
    item: {
        color: 'white',
        fontSize: 16
    },
    inputCon: {
        marginTop: 20,
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#181A20',
        borderRadius: 4,
        backgroundColor: 'silver',
    },
    textInput: {
        flex: 1,
        marginHorizontal: 5,
        padding: 10,
        fontSize: 16,
        color: '#333',
        textAlign: 'right'
    },
})