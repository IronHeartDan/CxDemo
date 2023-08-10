import { View, Text, useWindowDimensions, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react'
import futuresTradeStore from '../../stores/FuturesTradeStore'
import { Position } from '../../types/BinanceTypes'
import { Tabs } from 'react-native-collapsible-tab-view'
import { Button } from 'react-native-paper'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet'
import SharePosition from './SharePosition'
import ManagePosition from './ManagePosition'


const PositionsList = observer(() => {

    const size = useWindowDimensions()
    const manageSheetRef = useRef<BottomSheetModal | null>(null)
    const [currentManagePosition, setManagePosition] = useState<Position | null>(null)

    const shareSheetRef = useRef<BottomSheetModal | null>(null)
    const [currentSharePosition, setSharePosition] = useState<Position | null>(null)

    useEffect(() => {
        // This will force the component to re-render on changes to the observed data
    }, [futuresTradeStore.symbolMarkPrice])

    const renderemptyPositions = () => {
        return (
            <View style={{ height: size.height, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'rgba(255, 255, 255, 0.5)' }}>You have no open positions.</Text>
            </View>
        )
    }

    const showManageSheet = (position: Position) => {
        setManagePosition(position)
        manageSheetRef.current?.present()
    }

    const showShareSheet = (position: Position) => {
        setSharePosition(position)
        shareSheetRef.current?.present()
    }

    const renderPosition = ({ item }: { item: Position }) => {

        const symbol = item.symbol
        const leverage = Number(item.leverage)
        const positionAmount = Number(item.positionAmt)
        const entryPrice = Number(item.entryPrice)
        const initialMargin = Number(item.positionInitialMargin)
        const maintMargin = Number(item.maintMargin)
        const initialEquity = entryPrice * positionAmount / leverage
        let pnl;
        let marketPrice = 0
        let liquidation

        if (futuresTradeStore.symbolMarkPrice.has(symbol)) {
            marketPrice = Number(futuresTradeStore.symbolMarkPrice.get(symbol)!.p);
            pnl = Number(((marketPrice - entryPrice) * positionAmount).toFixed(2));
        } else {
            pnl = 0;
        }

        const roe = Number(((pnl / initialEquity) * 100).toFixed(2))


        if (marketPrice !== 0 && futuresTradeStore.marketSymbols.has(symbol)) {
            const lastPrice = futuresTradeStore.symbolTicker.get(symbol)?.c ?? 0
            const marketSymbol = futuresTradeStore.marketSymbols.get(symbol)!
            const liquidationFee = Number(marketSymbol.liquidationFee)
            liquidation = ((entryPrice * (1 + (1 / leverage)) - initialMargin - pnl) - (lastPrice - entryPrice) + liquidationFee).toFixed(2)
        }

        return (
            <View key={symbol} style={styles.card}>
                <View style={styles.row}>
                    <Text style={styles.symbol}>{symbol}</Text>
                    <View style={styles.cell}>
                        <TouchableOpacity onPress={() => showShareSheet(item)}>
                            <View style={{ alignSelf: 'flex-end', alignItems: 'flex-end' }}>
                                <MaterialCommunityIcons name="share-variant" color={"white"} size={12} />
                                <Text style={{ ...styles.title, ...styles.textRight, marginTop: 5 }}>{leverage}X</Text>
                            </View>
                        </TouchableOpacity>
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
                        <Text style={{ ...styles.item, ...styles.textRight }}>{initialMargin.toFixed(2)}</Text>
                    </View>
                    <View style={styles.cell}>
                        <Text style={{ ...styles.title, ...styles.textRight }}>Liq.Price</Text>
                        {liquidation && <Text style={{ ...styles.item, ...styles.textRight }}>{liquidation}</Text>}
                        {/* <Text style={{ ...styles.item, ...styles.textRight }}>--</Text> */}
                    </View>
                </View>
                <View style={{ ...styles.row, marginVertical: 10, justifyContent: 'space-between' }}>
                    <Button style={{ backgroundColor: 'white', }} onPress={() => { showManageSheet(item) }} icon="circle-edit-outline">
                        <Text style={{ color: 'black' }}>Leverage</Text>
                    </Button>
                    <Button style={{ backgroundColor: 'white', }} onPress={() => { showManageSheet(item) }} icon="stop-circle-outline">
                        <Text style={{ color: 'black' }}>Stop PNL</Text>
                    </Button>
                    <Button style={{ backgroundColor: 'white', }} onPress={() => { showManageSheet(item) }} icon="close">
                        <Text style={{ color: 'black' }}>Close</Text>
                    </Button>
                </View>
            </View>
        )
    }

    const renderBackdrop = useCallback((props: any) => (
        <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
        />
    ), [])

    return (
        <>
            <Tabs.FlatList
                data={futuresTradeStore.positions}
                renderItem={renderPosition}
                ListEmptyComponent={renderemptyPositions}
            />
            <BottomSheetModal
                ref={shareSheetRef}
                index={0}
                backdropComponent={renderBackdrop}
                backgroundStyle={{
                    backgroundColor: 'transparent',
                }}
                handleIndicatorStyle={{ display: 'none' }}
                enablePanDownToClose
                snapPoints={['100%']}>
                {currentSharePosition && <SharePosition position={currentSharePosition!} close={() => shareSheetRef.current?.close()} />}
            </BottomSheetModal>
            <BottomSheetModal
                ref={manageSheetRef}
                index={0}
                backdropComponent={renderBackdrop}
                backgroundStyle={{
                    backgroundColor: '#161A1E',
                }}
                handleIndicatorStyle={{ backgroundColor: 'white' }}
                enablePanDownToClose
                snapPoints={['60%']}>
                {currentManagePosition && <ManagePosition position={currentManagePosition!} close={() => manageSheetRef.current?.close()} />}
            </BottomSheetModal>
        </>
    )
})

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

export default PositionsList