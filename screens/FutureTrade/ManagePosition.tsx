import { StyleSheet, Text, View, TextInput, Keyboard } from 'react-native'
import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import { Position } from '../../types/BinanceTypes'
import { Button, SegmentedButtons } from 'react-native-paper'
import futuresTradeStore from '../../stores/FuturesTradeStore'
import Snackbar from 'react-native-snackbar'
import { FuturesOrderType_LT, OrderType } from '../../types/FuturesOrderTypes'
import Slider from '@react-native-community/slider'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

const ManagePosition = observer(({ position, close }: { position: Position, close: Function }) => {
    const [orderType, setOrderType] = useState<FuturesOrderType_LT>('MARKET')
    const [orderPrice, setOrderPrice] = useState('')
    const [orderQuantity, setOrderQuantity] = useState('')
    const [isKeyboardVisible, setKeyboardVisibility] = useState(false)

    const [icon, setIcon] = useState()

    useEffect(() => {
        Icon.getImageSource('circle', 24, 'white')
            .then(setIcon)

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


    return (
        <View style={styles.container}>
            <View style={{ flex: 1 }}>
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
                    <View style={{
                        ...styles.inputCon,
                        borderColor: Number(orderQuantity) > Number(position.positionAmt) ? 'red' : 'transparent',
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

                    <View style={{
                        marginVertical: 10
                    }}>
                        <Slider
                            minimumValue={1}
                            maximumValue={100}
                            // step={25}
                            thumbImage={icon}
                            minimumTrackTintColor='white'
                            maximumTrackTintColor='silver'
                        />
                    </View>
                </View>
            </View>
            {!isKeyboardVisible && <View>
                <Button style={{ backgroundColor: 'white', }} onPress={placeOrder} icon="check">
                    <Text style={{ color: 'black' }}>Confirm</Text>
                </Button>
            </View>}
        </View>
    )
})

export default ManagePosition

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        margin: 10,
        padding: 5,
    },
    inputCon: {
        marginTop: 20,
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#181A20',
        borderRadius: 4,
        backgroundColor: 'white',
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