import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import { Bracket, Position } from '../../types/BinanceTypes'
import Slider from '@react-native-community/slider'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { Button } from 'react-native-paper'
import futuresTradeStore from '../../stores/FuturesTradeStore'
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler'
import Snackbar from 'react-native-snackbar'

const HandlePositionLeverage = observer(({ position, close }: { position: Position, close: Function }) => {
    const [icon, setIcon] = useState()

    const [leverage, setLeverage] = useState(Number(position.leverage))
    const [brackets, setBrackets] = useState<Bracket[]>([])
    const [leverageBounds, setBounds] = useState({
        min: 1,
        max: 100
    })

    useEffect(() => {
        Icon.getImageSource('circle', 24, 'white')
            .then(setIcon)

        futuresTradeStore.fetchLeverageBrackets(position.symbol)
            .then((brackets) => {
                const initialLeverages = brackets.map(data => data.initialLeverage)
                const maxInitialLeverage = Math.max(...initialLeverages)
                const minInitialLeverage = Math.min(...initialLeverages)

                setBounds({
                    min: minInitialLeverage,
                    max: maxInitialLeverage
                })

                setBrackets(brackets.filter((bracket) => bracket.initialLeverage >= 5))
            })
            .catch((err) => console.log(err))
    }, [])

    const changeLeverage = async () => {
        if (leverage === Number(position.leverage)) {
            close()
            return
        }

        try {
            await futuresTradeStore.changeSymbolLeverage(
                position.symbol,
                leverage
            )
            Snackbar.show({
                text: `${position.symbol} Leverage Changed : ${leverage}`,
                duration: Snackbar.LENGTH_SHORT,
                backgroundColor: 'green',
                textColor: 'white'
            })
            close()
        } catch (error) {
            Snackbar.show({
                text: `${error}`,
                duration: Snackbar.LENGTH_SHORT,
                backgroundColor: 'white',
                textColor: 'red'
            })
            close()
        }
    }

    const renderBracket = ({ item, index }: { item: Bracket, index: number }) => {
        const initialLeverage = Number(item.initialLeverage)
        const selected = initialLeverage === leverage
        return (
            <View key={index}>
                <TouchableOpacity onPress={() => {
                    setLeverage(initialLeverage)
                }}>
                    <View style={{ margin: 10, padding: 10, backgroundColor: selected ? 'white' : 'black' }}>
                        <Text style={{ color: selected ? 'black' : 'white', textAlign: 'center' }}>{initialLeverage}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={{ flex: 1 }}>
                <Text style={{
                    color: 'white',
                    fontSize: 18,
                }}>Leverage {leverage}X</Text>

                <Slider
                    style={styles.slider}
                    value={leverage}
                    step={1}
                    onValueChange={setLeverage}
                    minimumValue={leverageBounds.min}
                    maximumValue={leverageBounds.max}
                    thumbImage={icon}
                    minimumTrackTintColor='white'
                    maximumTrackTintColor='silver'
                />

                <FlatList
                    horizontal
                    data={brackets}
                    renderItem={renderBracket}
                />
            </View>
            <View>
                <Button style={{ backgroundColor: 'white', }} onPress={changeLeverage} icon="check">
                    <Text style={{ color: 'black' }}>Confirm</Text>
                </Button>
            </View>
        </View>
    )
})

export default HandlePositionLeverage

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10
    },
    slider: {
        marginVertical: 50
    }
})