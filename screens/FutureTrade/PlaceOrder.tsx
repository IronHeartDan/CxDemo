import { StyleSheet, View, Text, TextInput } from 'react-native'
import React, { useCallback, useState } from 'react'
import { Button, Chip } from 'react-native-paper';
import OrderBook from '../../components/OrderBook';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { observer } from 'mobx-react';
import futuresTradeStore from '../../stores/FuturesTradeStore';
import Snackbar from 'react-native-snackbar'
import TradeHistory from '../../components/TradeHistory';
import { FuturesOrderType_LT, LimitNewFuturesOrder, NewFuturesOrder, NewFuturesOrderBase, OrderSide, OrderSide_LT, OrderType } from '../../types/FuturesOrderTypes';
import { FlatList } from 'react-native-gesture-handler';


const PlaceOrder = observer(({ close }: { close: any }) => {

    const [loading, setLoading] = useState(false)

    const [orderType, setOrderType] = useState<FuturesOrderType_LT>(OrderType.LIMIT)
    const [orderPrice, setOrderPrice] = useState('')
    const [orderQuantity, setOrderQuantity] = useState('')
    const [orderStopPrice, setOrderStopPrice] = useState('')



    const placeOrder = async (side: OrderSide_LT) => {

        // if (orderPrice.length === 0 || orderQuantity.length === 0 || orderStopPrice.length === 0) {
        //     Snackbar.show({
        //         text: "Invalid Input",
        //         duration: Snackbar.LENGTH_SHORT,
        //         backgroundColor: 'white',
        //         textColor: 'red'
        //     });
        //     return;
        // }


        try {
            await futuresTradeStore.placeOrder({
                side: side,
                orderType: orderType,
                orderQuantity: orderQuantity,
                orderPrice: orderPrice,
                stopPrice: orderStopPrice
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

    const renderOrderType = useCallback(({ item, index }: { item: FuturesOrderType_LT, index: number }) => {

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
                        data={Object.values(OrderType) as FuturesOrderType_LT[]}
                        renderItem={renderOrderType}
                    />
                </View>

                <View style={{ marginTop: 10 }}>
                    {orderType === OrderType.STOP && <View style={styles.inputCon}>
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

                    {orderType !== OrderType.MARKET && <View style={styles.inputCon}>
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
                            onChangeText={setOrderQuantity}
                            value={orderQuantity}
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
                        onPress={() => placeOrder(OrderSide.BUY)}
                    >
                        Buy/Long
                    </Button>

                    <Button
                        mode="contained"
                        buttonColor="#f6465d"
                        dark
                        style={{ flex: 1, borderRadius: 5, marginStart: 10 }}
                        onPress={() => placeOrder(OrderSide.SELL)}
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