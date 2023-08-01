import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native'
import React from 'react'
import { observer } from 'mobx-react'
import futuresTradeStore from '../../stores/FuturesTradeStore'
import { Order, StreamOrder } from '../../types/BinanceTypes'
import { Tabs } from 'react-native-collapsible-tab-view'
import binanceClient from '../../utils/BinanceClient'
import Snackbar from 'react-native-snackbar'


const OrdersList = observer(() => {

    const size = useWindowDimensions()

    const renderemptyOrders = () => {
        return (
            <View style={{ height: size.height, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'rgba(255, 255, 255, 0.5)' }}>You have no open orders.</Text>
            </View>
        )
    }

    const renderOrder = ({ item }: { item: Order | StreamOrder | any }) => {

        const orderId = item.orderId ?? item.o.i
        const status = item.status ?? item.o.X
        const symbol = item.symbol ?? item.o.s
        const side = item.side ?? item.o.S
        const quantity = item.origQty ?? item.o.q
        const price = item.price ?? item.o.p

        const cancelOrder = async () => {
            await binanceClient.futuresCancelOrder({
                symbol: 'BTCUSDT',
                orderId: orderId,
            });

            Snackbar.show({
                text: 'Order Cancelled',
                duration: Snackbar.LENGTH_SHORT,
                backgroundColor: 'white',
                textColor: 'red'
            })
        }

        return (
            <View key={orderId} style={{
                margin: 10,
                padding: 10,
                backgroundColor: '#161A1E',
                elevation: 2,
                borderRadius: 10
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.5)' }}>{symbol}</Text>
                    {/* <Text style={{ marginStart: 5, fontWeight: 'bold' }}>{status}</Text> */}
                </View>

                <View style={{ flexDirection: 'row' }}>
                    <View style={{ flex: 1, marginTop: 10, justifyContent: 'space-evenly' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.5)' }}>Side : </Text><Text style={{ color: 'rgba(255, 255, 255, 0.5)' }}>{side}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.5)' }}>Price : </Text><Text style={{ color: 'rgba(255, 255, 255, 0.5)' }}>{price}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.5)' }}>Quantity : </Text><Text style={{ color: 'rgba(255, 255, 255, 0.5)' }}>{quantity}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={{ alignSelf: 'flex-end' }} onPress={cancelOrder}>
                        <Text style={{ color: "#f6465d" }}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    return (
        <Tabs.FlatList
            data={futuresTradeStore.orders}
            renderItem={renderOrder}
            ListEmptyComponent={renderemptyOrders}
        />
    )
})

export default OrdersList