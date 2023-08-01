import {
    View,
    Text,
    StyleSheet,
    StatusBar,
} from 'react-native'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import OrdersList from './OrdersList'
import PositionsList from './PositionsList'
import OrderBook from '../../components/OrderBook'
import WebView from 'react-native-webview'
import {
    BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { Button } from 'react-native-paper';
import PlaceOrder from './place-order'
import MarketInfo from '../../components/MarketInfo'
import futuresTradeStore from '../../stores/FuturesTradeStore'
import EnableFutures from './EnableFutures'
import { observer } from 'mobx-react'
import { TabItemProps, Tabs } from 'react-native-collapsible-tab-view'
import Snackbar from 'react-native-snackbar'
import TradeHistory from '../../components/TradeHistory'


const Trade = observer(() => {

    const [activeTab, setActiveTab] = useState(0)
    const placeOrderSheetRef = useRef<BottomSheetModal | null>(null)
    const enableFuturesSheetRef = useRef<BottomSheetModal | null>(null)


    useEffect(() => {
        if (!futuresTradeStore.isMarketConnected) {
            Snackbar.show({
                text: 'Connecting',
                duration: Snackbar.LENGTH_INDEFINITE,
                backgroundColor: 'white',
                textColor: 'red'
            })
        } else {
            Snackbar.dismiss()
            Snackbar.show({
                text: 'Connected',
                duration: Snackbar.LENGTH_SHORT,
                backgroundColor: 'green',
                textColor: 'white'
            })
        }
    }, [futuresTradeStore.isMarketConnected])


    useEffect(() => {
        futuresTradeStore.initMarketSocket()

        // return () => {
        //     futuresTradeStore.clean()
        // }
    }, [])


    useEffect(() => {

        if (futuresTradeStore.isFuturesEnabled) {
            futuresTradeStore.initUserSocker()
            futuresTradeStore.loadAllFromBinance()
        }

    }, [futuresTradeStore.isFuturesEnabled])


    const header = useCallback(() => {
        return (
            <View style={{ width: '100%' }}>
                <WebView
                    style={{ backgroundColor: "transparent", aspectRatio: 1 }}
                    source={{ uri: "https://cryptoxpress.com/charts-dark?symbol=BTCUSDT" }}
                    allowFileAccessFromFileURLs={true}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    allowFileAccess={true}
                    allowUniversalAccessFromFileURLs={true}
                    originWhitelist={["*"]}
                    onShouldStartLoadWithRequest={() => true}
                />
                <View style={{ padding: 5, marginVertical: 10, flexDirection: 'row' }}>
                    <View style={{ flex: 0.6 }}>
                        <OrderBook />
                    </View>
                    <View style={{ flex: 0.4 }}>
                        <MarketInfo />
                    </View>
                </View>
                <View style={{ padding: 5, marginVertical: 10 }}>
                    <TradeHistory />
                </View>
            </View>
        )
    }, [])

    const close = () => {
        placeOrderSheetRef?.current?.close()
        enableFuturesSheetRef?.current?.close()
    }

    const renderTabText = useCallback(({ name, index }: TabItemProps<any>) => (
        <Text style={{ color: index === activeTab ? 'white' : 'rgba(255, 255, 255, 0.5)' }}>{name}</Text>
    ), [activeTab])


    return (
        <View style={styles.container}>
            <StatusBar backgroundColor='#161A1E' barStyle='light-content' />
            <Tabs.Container
                renderHeader={header}
                headerContainerStyle={{
                    backgroundColor: '#161A1E',
                }}
                onIndexChange={setActiveTab}
            >
                <Tabs.Tab name='Positions' label={renderTabText}>
                    <PositionsList />
                </Tabs.Tab>
                <Tabs.Tab name='Orders' label={renderTabText}>
                    <OrdersList />
                </Tabs.Tab>
            </Tabs.Container>
            <View style={{ padding: 10, backgroundColor: '#161A1E' }}>
                {futuresTradeStore.isFuturesEnabled && <Button
                    mode="contained"
                    buttonColor='#18448D'
                    onPress={() => {
                        placeOrderSheetRef?.current?.present()
                    }}
                    style={{ borderRadius: 5 }}
                >
                    Place Order
                </Button>}
                {!futuresTradeStore.isFuturesEnabled && <Button
                    mode="contained"
                    buttonColor='#18448D'
                    onPress={() => {
                        enableFuturesSheetRef?.current?.present();
                    }}
                    style={{ borderRadius: 5 }}
                >
                    Enable Futures Trading
                </Button>}
            </View>
            <BottomSheetModal
                ref={placeOrderSheetRef}
                index={0}
                enablePanDownToClose
                snapPoints={['100%']}
                backgroundStyle={{
                    backgroundColor: '#161A1E',
                }}
                handleIndicatorStyle={{
                    backgroundColor: 'white'
                }}>
                <PlaceOrder close={close} />
            </BottomSheetModal>
            <BottomSheetModal
                ref={enableFuturesSheetRef}
                index={0}
                enablePanDownToClose
                snapPoints={['100%']}
                backgroundStyle={{
                    backgroundColor: '#161A1E',
                }}
                handleIndicatorStyle={{
                    backgroundColor: 'white'
                }}>
                <EnableFutures close={close} />
            </BottomSheetModal>
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#161A1E',
    },
});

export default Trade
