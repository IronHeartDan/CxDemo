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
import moment from 'moment'


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
        const symbol = item.symbol
        const status = item.status
        const side = item.side
        const type = item.type
        const quantity = item.origQty
        const price = item.price
        const date = moment.unix(item.time / 1000).local(true).format('YYYY-MM-DD')
        const time = moment.unix(item.time / 1000).local(true).format('HH:mm:ss')

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
                    <Text style={{ color: side === OrderSide.BUY ? 'green' : 'red' }}>{side}</Text>
                    <Text style={styles.symbol}> / {symbol}</Text>
                </View>

                <View style={styles.row}>
                    <View style={styles.cell}>
                        <Text style={styles.title}>Type</Text>
                        <Text style={{
                            ...styles.item,
                            textTransform: 'capitalize'
                        }}>{type}</Text>
                    </View>
                    <View style={styles.cell}>
                        <Text style={{ ...styles.title, ...styles.textRight }}>Price</Text>
                        <Text style={{ ...styles.item, ...styles.textRight }}>{price}</Text>
                    </View>
                    <View style={styles.cell}>
                        <Text style={{ ...styles.title, ...styles.textRight }}>Size</Text>
                        <Text style={{ ...styles.item, ...styles.textRight }}>{quantity}</Text>
                    </View>
                </View>
                <View style={{ ...styles.row, marginTop: 20, marginBottom: 10, justifyContent: 'space-between' }}>
                    <View>
                        <Text style={{ color: 'white' }}>{date}</Text>
                        <Text style={{ color: 'white' }}>{time}</Text>
                    </View>
                    <TouchableOpacity onPress={cancelOrder}>
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