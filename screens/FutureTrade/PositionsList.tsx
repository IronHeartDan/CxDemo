import { View, Text, useWindowDimensions, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react'
import futuresTradeStore from '../../stores/FuturesTradeStore'
import { Position } from '../../types/BinanceTypes'
import { Tabs } from 'react-native-collapsible-tab-view'
import { Button, Divider } from 'react-native-paper'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import SharePosition from './SharePosition'
import ManagePosition from './ManagePosition'
import PositionInfo from '../../components/PositionInfo'
import HandlePositionLeverage from './HandlePositionLeverage'

export type ManagePositionAction = 'CLOSE' | 'PNL' | 'LEVERAGE'

const PositionsList = observer(() => {

    const size = useWindowDimensions()

    const [currentPosition, setCurrentPosition] = useState<Position | null>(null)
    const [currentManageAction, setManageAction] = useState<ManagePositionAction | null>(null)

    const manageSheetRef = useRef<BottomSheetModal | null>(null)
    const shareSheetRef = useRef<BottomSheetModal | null>(null)

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

    const showShareSheet = (position: Position) => {
        setCurrentPosition(position)
        shareSheetRef.current?.present()
    }

    const showManageSheet = (position: Position, action: ManagePositionAction) => {
        setCurrentPosition(position)
        setManageAction(action)
        manageSheetRef.current?.present()
    }

    const calculateLiquidationPrice = (
        WB: number,
        TMM1: number,
        UPNL1: number,
        cumB: number,
        cumL: number,
        cumS: number,
        Side1BOTH: number,
        Position1BOTH: number,
        EP1BOTH: number,
        Position1LONG: number,
        EP1LONG: number,
        Position1SHORT: number,
        EP1SHORT: number,
        MMRB: number,
        MMRL: number,
        MMRS: number
    ): number => {
        const liquidationPrice =
            (WB - TMM1 + UPNL1 + cumB + cumL + cumS - Side1BOTH * Position1BOTH * EP1BOTH - Position1LONG + Position1SHORT * EP1SHORT) /
            (Position1BOTH * MMRB + Position1LONG * MMRL + Position1SHORT * MMRS - Side1BOTH * Position1BOTH - Position1LONG + Position1SHORT);

        return liquidationPrice;
    }

    const getMaintMarginRatio = (positionValue: number): number => {
        if (positionValue >= 0 && positionValue <= 50000) {
            return 0.004; // 0.40%
        } else if (positionValue > 50000 && positionValue <= 250000) {
            return 0.005; // 0.50%
        } else if (positionValue > 250000 && positionValue <= 3000000) {
            return 0.01; // 1.00%
        } else if (positionValue > 3000000 && positionValue <= 20000000) {
            return 0.025; // 2.50%
        } else if (positionValue > 20000000 && positionValue <= 40000000) {
            return 0.05; // 5.00%
        } else if (positionValue > 40000000 && positionValue <= 100000000) {
            return 0.10; // 10.00%
        } else if (positionValue > 100000000 && positionValue <= 120000000) {
            return 0.125; // 12.50%
        } else if (positionValue > 120000000 && positionValue <= 200000000) {
            return 0.15; // 15.00%
        } else if (positionValue > 200000000 && positionValue <= 300000000) {
            return 0.25; // 25.00%
        } else if (positionValue > 300000000 && positionValue <= 500000000) {
            return 0.50; // 50.00%
        } else {
            // Default case for positions exceeding the specified ranges
            return 0.01; // 1.00%
        }
    }

    const renderPosition = ({ item }: { item: Position }) => {

        const symbol = item.symbol
        const leverage = Number(item.leverage)
        const positionAmount = Number(item.positionAmt)
        const entryPrice = Number(item.entryPrice)
        const initialMargin = Number(item.positionInitialMargin)
        const maintenanceMargin = Number(item.maintMargin)
        const initialEquity = entryPrice * positionAmount / leverage
        let pnl;
        let marketPrice = 0

        if (futuresTradeStore.symbolMarkPrice.has(symbol)) {
            marketPrice = Number(futuresTradeStore.symbolMarkPrice.get(symbol)!.p);
            pnl = Number(((marketPrice - entryPrice) * positionAmount).toFixed(2));
        } else {
            pnl = 0;
        }

        const roe = Number(((pnl / initialEquity) * 100).toFixed(2))

        const maintenanceMarginAllOthers = futuresTradeStore.positions
            .filter(position => position.symbol !== item.symbol) // Exclude Contract 1
            .reduce((sum, position) => sum + parseFloat(position.maintMargin), 0);

        const unrealizedPNLAllOthers = futuresTradeStore.positions
            .filter(position => position.symbol !== item.symbol) // Exclude Contract 1
            .reduce((sum, position) => sum + parseFloat(position.unrealizedProfit), 0);

        const liquidation = calculateLiquidationPrice(
            futuresTradeStore.totalWalletBalance,
            maintenanceMarginAllOthers,
            unrealizedPNLAllOthers,
            parseFloat(item.maintMargin),
            0,
            0,
            1,
            parseFloat(item.positionAmt),
            parseFloat(item.entryPrice),
            0,
            0,
            0,
            0,
            getMaintMarginRatio(parseFloat(item.notional)), // Use position value to get maintMarginRatio
            0,
            0
        );


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
                        {liquidation && <Text style={{ ...styles.item, ...styles.textRight }}>{liquidation.toFixed(2)}</Text>}
                        {/* <Text style={{ ...styles.item, ...styles.textRight }}>--</Text> */}
                    </View>
                </View>
                <View style={{ ...styles.row, marginVertical: 10, justifyContent: 'space-between' }}>
                    <Button style={{ backgroundColor: 'white', }} onPress={() => { showManageSheet(item, 'LEVERAGE') }} icon="circle-edit-outline">
                        <Text style={{ color: 'black' }}>Leverage</Text>
                    </Button>
                    <Button style={{ backgroundColor: 'white', }} onPress={() => { showManageSheet(item, 'PNL') }} icon="stop-circle-outline">
                        <Text style={{ color: 'black' }}>Stop PNL</Text>
                    </Button>
                    <Button style={{ backgroundColor: 'white', }} onPress={() => { showManageSheet(item, 'CLOSE') }} icon="close">
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
                {currentPosition && <SharePosition position={currentPosition!} close={() => shareSheetRef.current?.close()} />}
            </BottomSheetModal>
            <BottomSheetModal
                ref={manageSheetRef}
                index={0}
                backdropComponent={renderBackdrop}
                backgroundStyle={{
                    backgroundColor: '#161A1E',
                }}
                handleIndicatorStyle={{ backgroundColor: 'white' }}
                enableContentPanningGesture={false}
                enablePanDownToClose
                snapPoints={['60%']}>
                <BottomSheetScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    {currentPosition && <PositionInfo position={currentPosition} />}
                    <Divider style={{ margin: 10 }} />
                    {currentPosition && currentManageAction === 'LEVERAGE' && <HandlePositionLeverage position={currentPosition!} close={() => manageSheetRef.current?.close()} />}
                    {currentPosition && currentManageAction === 'PNL' && <ManagePosition position={currentPosition!} close={() => manageSheetRef.current?.close()} />}
                    {currentPosition && currentManageAction === 'CLOSE' && <ManagePosition position={currentPosition!} close={() => manageSheetRef.current?.close()} />}
                </BottomSheetScrollView>
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