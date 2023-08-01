import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Button } from 'react-native-paper';
import futuresTradeStore from '../../stores/FuturesTradeStore';
import { runInAction } from 'mobx';

const EnableFutures = ({ close }: { close: any }) => {
    return (
        <View style={{ flex: 1 }}>
            <BottomSheetScrollView>
                <Image source={require('../../assets/asset_futures_trading.png')}
                    style={{
                        width: '100%',
                        height: 250,
                    }}
                />
                <View style={styles.container}>
                    <Text style={styles.title}>Welcome to Futures Trading</Text>
                    <Text style={styles.text}>
                        Futures trading is a way to invest in the future value of assets like commodities, currencies, or stock market
                        indices. It's like making a deal to buy or sell something at a specific price on a particular date in the future.
                    </Text>
                    <Text style={styles.subTitle}>How Does it Work?</Text>
                    <Text style={styles.text}>
                        Imagine you're a farmer who grows wheat. You want to lock in a good price for your wheat crop before you even
                        harvest it. On the other side, there's a baker who needs wheat to make bread. They want to secure a stable price
                        for the wheat they'll need in the future. This is where futures trading comes in.
                    </Text>
                    <Text style={styles.text}>
                        1. The Contract: You and the baker enter into a contract called a "futures contract." This agreement states the
                        amount of wheat, the price per bushel, and the future date when the deal will be executed (the expiration date).
                    </Text>
                    <Text style={styles.text}>
                        2. Speculating on Price: Some traders participate in futures trading not to buy or sell the actual goods but to
                        speculate on the price movements. They try to predict whether the price of wheat will go up or down before the
                        contract expires.
                    </Text>
                    <Text style={styles.text}>
                        3. Long and Short Positions: If a trader expects the price of wheat to rise, they take a "long" position,
                        meaning they agree to buy the wheat at today's price (locking it in) and hope to sell it for a higher price
                        later. Conversely, if someone expects the price to fall, they take a "short" position, agreeing to sell wheat
                        they don't own at today's price and buy it back at a lower price later.
                    </Text>
                    <Text style={styles.text}>
                        4. Margin and Leverage: To participate in futures trading, you don't need to pay the full value of the contract
                        upfront. Instead, you pay a fraction called "margin." It allows you to control a more substantial contract – this
                        is called leverage. While leverage can amplify gains, it also increases potential losses, so it's essential to be
                        cautious.
                    </Text>
                    <Text style={styles.text}>
                        5. Closing the Contract: Most futures traders close their contracts before the expiration date. They either
                        buy/sell an opposite position or sell/buy the actual asset to offset their obligations. This way, they can secure
                        profits or limit losses.
                    </Text>
                    <Text style={styles.subTitle}>Why Should You Consider Futures Trading?</Text>
                    <Text style={styles.text}>
                        - Hedging: Farmers and businesses use futures contracts to protect themselves from price volatility. It gives them
                        certainty about future prices and reduces risks.
                    </Text>
                    <Text style={styles.text}>
                        - Portfolio Diversification: Futures trading can add diversity to your investment portfolio, as it involves
                        different assets from traditional stocks and bonds.
                    </Text>
                    <Text style={styles.text}>
                        - Potential for Profits: By correctly predicting price movements, you can potentially make profits whether the
                        market goes up or down.
                    </Text>
                    <Text style={styles.caution}>
                        A Word of Caution: Futures trading involves risks. Prices can fluctuate unpredictably, and losses are possible.
                        It's crucial to understand the assets you're trading, set a clear strategy, and never invest more than you can
                        afford to lose.
                    </Text>
                    <Text style={styles.text}>In conclusion, futures trading is a tool that can help you manage risk and explore opportunities in the financial markets. Just like any investment, it requires knowledge, discipline, and careful consideration. Happy trading!</Text>
                </View>
            </BottomSheetScrollView>
            <View style={{ padding: 10, backgroundColor: '#161A1E' }}>
                <Button
                    mode="contained"
                    buttonColor='#18448D'
                    onPress={() => {
                        runInAction(() => {
                            futuresTradeStore.isFuturesEnabled = true
                        })
                        if (close) close()
                    }}
                    style={{ borderRadius: 5 }}
                >
                    Enable
                </Button>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: 'white'
    },
    subTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
        color: 'white'
    },
    text: {
        fontSize: 14,
        marginBottom: 5,
        color: 'rgba(255, 255, 255, 0.5)',
    },
    caution: {
        fontSize: 14,
        fontWeight: '300',
        marginBottom: 10,
        color: 'red',
    },
});

export default EnableFutures
