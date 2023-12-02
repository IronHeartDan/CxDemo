import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useRef } from 'react'
import Share from 'react-native-share'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { observer } from 'mobx-react'
import LinearGradient from 'react-native-linear-gradient'
import ViewShot, { captureRef } from 'react-native-view-shot'
import futuresTradeStore from './FuturesTradeStore'

const SharePosition = observer(({ position, close }) => {

    const viewShotRef = useRef(null)


    const symbol = position.symbol
    const leverage = Number(position.leverage)
    const positionAmount = Number(position.positionAmt)
    const entryPrice = Number(position.entryPrice)
    const margin = Number(position.initialMargin)
    const initialEquity = entryPrice * positionAmount / leverage
    let pnl;
    let marketPrice = 0

    if (futuresTradeStore.symbolMarkPrice.has(symbol)) {
        marketPrice = Number(futuresTradeStore.symbolMarkPrice.get(symbol).p);
        pnl = Number(((marketPrice - entryPrice) * positionAmount).toFixed(2));
    } else {
        pnl = 0;
    }

    const roe = Number(((pnl / initialEquity) * 100).toFixed(2))


    const captureAndShare = async () => {
        try {
            const imageURI = await captureRef(viewShotRef, {
                format: 'png', // can use other formats as well
            })

            // const base64Image = await RNFetchBlob.fs.readFile(imageURI, 'base64')
            Share.open({
                title: 'Check Out My Earnings on CryptoXpress',
                // url: `data:image/png;base64,${base64Image}`,
                url: imageURI,
                type: 'image/png'
            })
        } catch (error) {
            console.log(error)
        }
    }


    return (
        <View style={{ flex: 1 }}>
            <ViewShot style={styles.cardCon} ref={viewShotRef}>
                <View style={styles.card}>
                    <LinearGradient
                        colors={['#1E2D64', '#7C4DFF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                    />
                    <View style={{ flex: 1 }}>
                        <View style={styles.row}>
                            <Text style={styles.symbol}>{symbol}</Text>
                            <View style={styles.cell}>
                                <View style={{ alignSelf: 'flex-end', alignItems: 'flex-end' }}>
                                    <Text style={{ ...styles.title, ...styles.textRight, marginTop: 5 }}>{leverage}X</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.row}>
                            <View style={styles.cell}>
                                <Text style={styles.title}>Entry Price</Text>
                                <Text style={styles.item}>{Number(entryPrice).toFixed(2)}</Text>
                            </View>
                            <View style={styles.cell}>
                                <Text style={{ ...styles.title, ...styles.textRight }}>Mark Price</Text>
                                <Text style={{ ...styles.item, ...styles.textRight }}>{marketPrice.toFixed(2)}</Text>
                            </View>
                            <View style={styles.cell}>
                                <Text style={{ ...styles.title, ...styles.textRight }}>Size</Text>
                                <Text style={{ ...styles.item, ...styles.textRight }}>{positionAmount}</Text>
                            </View>
                        </View>
                        <View style={styles.row}>
                            <View style={styles.cell}>
                                <Text style={styles.title}>PNL(ROE %)</Text>
                                <Text style={{ color: pnl < 0 ? 'red' : pnl > 0 ? 'green' : 'rgba(255, 255, 255, 0.5)', }}>{pnl}</Text>
                                <Text style={{ color: roe < 0 ? 'red' : roe > 0 ? 'green' : 'rgba(255, 255, 255, 0.5)', }}>({roe}%)</Text>
                            </View>
                            <View style={styles.cell}>
                                <Text style={{ ...styles.title, ...styles.textRight }}>Margin</Text>
                                <Text style={{ ...styles.item, ...styles.textRight }}>{margin.toFixed(2)}</Text>
                            </View>
                            <View style={styles.cell}>
                                <Text style={{ ...styles.title, ...styles.textRight }}>Liq.Price</Text>
                                <Text style={{ ...styles.item, ...styles.textRight }}>--</Text>
                            </View>
                        </View>
                    </View>
                    <Text style={{ ...styles.symbol, textAlign: 'center' }}>CryptoXpress</Text>
                </View>
            </ViewShot>
            <View style={styles.actionCon}>
                <TouchableOpacity onPress={captureAndShare} style={styles.action}>
                    <View>
                        <MaterialCommunityIcons name="share" color={"white"} size={30} />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { close() }} style={styles.action}>
                    <View>
                        <MaterialCommunityIcons name="close" color={"white"} size={30} />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    )
})

export default SharePosition

const styles = StyleSheet.create({
    cardCon: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    },
    card: {
        width: '100%',
        height: 400,
        borderRadius: 20,
        padding: 20,
        overflow: 'hidden',
    },
    actionCon: {
        height: 'auto',
        flexDirection: 'row',
        gap: 10,
        padding: 5,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'black',
    },
    action: {
        width: 70,
        aspectRatio: 1,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#161A1E'
    },
    symbol: {
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
        color: 'white',
        fontSize: 14
    },
    item: {
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