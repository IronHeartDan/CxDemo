import { StyleSheet, View, Text, TextInput, FlatList } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { Button, Chip } from 'react-native-paper';
import OrderBook from '../../components/OrderBook';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { observer } from 'mobx-react';
import futuresTradeStore from '../../stores/FuturesTradeStore';
import Snackbar from 'react-native-snackbar'
import TradeHistory from '../../components/TradeHistory';


const OrderTypes = {
    LIMIT: "LIMIT",
    MARKET: "MARKET",
    STOP: "STOP",
} as const

type OrderType = (typeof OrderTypes)[keyof typeof OrderTypes]

const PlaceOrder = observer(({ close }: { close: any }) => {

    const [loading, setLoading] = useState(false)

    const [orderType, setOrderType] = useState<OrderType>(OrderTypes.LIMIT)
    const [orderPrice, setOrderPrice] = useState('')
    const [orderSize, setOrderSize] = useState('')
    const [orderStopPrice, setOrderStopPrice] = useState('')



    const placeOrder = async (side: any) => {
        try {
            await futuresTradeStore.placeOrder(
                side,
                orderType,
                Number(orderSize),
                Number(orderPrice),
                Number(orderStopPrice)
            )

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

    const renderOrderType = useCallback(({ item, index }: { item: OrderType, index: number }) => {

        return (
            <Chip
                key={index}
                onPress={() => setOrderType(item)}
                style={{
                    backgroundColor: orderType === item ? '#18448D' : '#ccc',
                    elevation: 4,
                    marginVertical: 4,
                    marginHorizontal: 4,
                    marginStart: index === 0 ? 0 : 4
                }}
                textStyle={{
                    color: orderType === item ? 'white' : '#18448D',
                    paddingHorizontal: 12,
                }}
            >{item}
            </Chip>
        )
    }, [orderType])


    return (
        <BottomSheetScrollView>
            <View style={styles.container}>
                <View>
                    <Text style={{ fontSize: 24, color: 'white' }}>{futuresTradeStore.currentSymbol}</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: 'green' }}>Live </Text>
                        {futuresTradeStore.symbolTicker.has(futuresTradeStore.currentSymbol) && <Text style={{ color: 'white' }}>
                            {futuresTradeStore.symbolTicker.get(futuresTradeStore.currentSymbol)?.c.slice(0, 10)}
                        </Text>}
                    </View>
                </View>

                <View style={{ marginTop: 10 }}>
                    <FlatList
                        horizontal
                        data={Object.values(OrderTypes)}
                        renderItem={renderOrderType}
                    />
                </View>

                <View style={{ marginTop: 10 }}>
                    {orderType === OrderTypes.STOP && <View style={styles.inputCon}>
                        <Text>Stop Price</Text>
                        <TextInput style={styles.textInput} keyboardType="number-pad"
                            onChangeText={setOrderStopPrice}
                            value={orderStopPrice}
                            placeholder='0'
                        />
                        {futuresTradeStore.marketSymbols.has(futuresTradeStore.currentSymbol) && <Text>
                            {futuresTradeStore.marketSymbols.get(futuresTradeStore.currentSymbol)!.quoteAsset}
                        </Text>}
                    </View>}

                    {orderType !== OrderTypes.MARKET && <View style={styles.inputCon}>
                        <Text>Price</Text>
                        <TextInput style={styles.textInput} keyboardType="number-pad"
                            onChangeText={setOrderPrice}
                            value={orderPrice}
                            placeholder='0'
                        />
                        {futuresTradeStore.marketSymbols.has(futuresTradeStore.currentSymbol) && <Text>
                            {futuresTradeStore.marketSymbols.get(futuresTradeStore.currentSymbol)!.quoteAsset}
                        </Text>}
                    </View>}

                    <View style={styles.inputCon}>
                        <Text>Size</Text>
                        <TextInput style={styles.textInput} keyboardType="number-pad"
                            onChangeText={setOrderSize}
                            value={orderSize}
                            placeholder='0'
                        />
                        {futuresTradeStore.marketSymbols.has(futuresTradeStore.currentSymbol) && <Text>
                            {futuresTradeStore.marketSymbols.get(futuresTradeStore.currentSymbol)!.baseAsset}
                        </Text>}
                    </View>
                </View>


                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                    <Button
                        mode="contained"
                        buttonColor="#0ecb81"
                        dark
                        style={{ flex: 1, borderRadius: 5 }}
                        onPress={() => placeOrder('BUY')}
                    >
                        Buy/Long
                    </Button>

                    <Button
                        mode="contained"
                        buttonColor="#f6465d"
                        dark
                        style={{ flex: 1, borderRadius: 5, marginStart: 10 }}
                        onPress={() => placeOrder('SELL')}
                    >
                        Sell/Short
                    </Button>
                </View>
                <View style={{ marginVertical: 10 }}>
                    <TradeHistory />
                </View>
                <View style={{ marginVertical: 10 }}>
                    <OrderBook horizontal />
                </View>
            </View>
        </BottomSheetScrollView>
    )
})

const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    inputCon: {
        marginTop: 10,
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
        marginStart: 5,
        padding: 10,
        fontSize: 16,
        color: '#333',
        textAlign: 'right'
    },
});

export default PlaceOrder