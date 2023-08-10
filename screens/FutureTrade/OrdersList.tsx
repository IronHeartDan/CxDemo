import { View, Text, TouchableOpacity, useWindowDimensions, StyleSheet } from 'react-native'
import React from 'react'
import { observer } from 'mobx-react'
import futuresTradeStore from '../../stores/FuturesTradeStore'
import { Order } from '../../types/BinanceTypes'
import { Tabs } from 'react-native-collapsible-tab-view'
import binanceClient from '../../utils/BinanceClient'
import Snackbar from 'react-native-snackbar'
import { Button } from 'react-native-paper'
import { OrderSide } from '../../types/FuturesOrderTypes'


const OrdersList = observer(() => {

    const size = useWindowDimensions()

    const renderemptyOrders = () => {
        return (
            <View style={{ height: size.height, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'rgba(255, 255, 255, 0.5)' }}>You have no open orders.</Text>
            </View>
        )
    }

    const renderOrder = ({ item }: { item: Order }) => {

        const orderId = item.orderId
        const status = item.status
        const symbol = item.symbol
        const side = item.side
        const quantity = item.origQty
        const price = item.price

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
            <View key={orderId} style={styles.card}>
                <View style={styles.row}>
                    <Text style={styles.symbol}>{symbol} / </Text>
                    <Text style={{ color: side === OrderSide.BUY ? 'green' : 'red' }}>{side}</Text>
                </View>

                <View style={styles.row}>
                    <View style={styles.cell}>
                        <Text style={styles.title}>Quantity</Text>
                        <Text style={styles.item}>{quantity}</Text>
                    </View>
                    <View style={styles.cell}>
                        <Text style={styles.title}>Price</Text>
                        <Text style={styles.item}>{price}</Text>
                    </View>
                </View>
                <View style={{ ...styles.row, marginVertical: 10, justifyContent: 'flex-end' }}>
                    <Button style={{ backgroundColor: 'white' }} onPress={cancelOrder} icon="close">
                        <Text style={{ color: 'black' }}>Cancel</Text>
                    </Button>
                    {/* <Text style={{ color: "#f6465d" }}>Cancel</Text> */}
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

const styles = StyleSheet.create({
    card: {
        margin: 10,
        padding: 5,
        backgroundColor: 'black',
        elevation: 2,
        borderRadius: 10
    },
    symbol: {
        // color: 'rgba(255, 255, 255, 0.5)',
        color: 'white',
        fontSize: 24,
    },
    row: {
        marginTop: 10,
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    cell: {
        flex: 1,
        paddingVertical: 5
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
    textRight: {
        textAlign: 'right'
    },
    textLeft: {
        textAlign: 'left'
    },
})