import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { observer } from 'mobx-react'
import futuresTradeStore from '../stores/FuturesTradeStore';

const MarketInfo = observer(() => {

    const getTimeDiff = (nextTime: number) => {
        const currentTime = Date.now();
        const timeDifference = nextTime - currentTime;

        if (timeDifference <= 0) {
            return '00:00:00';
        }

        const totalSeconds = Math.floor(timeDifference / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const formattedHours = String(hours).padStart(2, '0');
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(seconds).padStart(2, '0');

        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    };

    return (
        <View style={styles.container}>
            <View style={styles.infoCell}>
                {futuresTradeStore.markPrice &&
                    <Text style={styles.infoCellValue}>
                        {Math.round(parseFloat(futuresTradeStore.markPrice.p) * 10) / 10}
                    </Text>}
                <Text style={styles.infoCellLable}>Mark</Text>
            </View>
            <View style={styles.infoCell}>
                {futuresTradeStore.markPrice &&
                    <Text style={styles.infoCellValue}>
                        {Math.round(parseFloat(futuresTradeStore.markPrice.i) * 10) / 10}
                    </Text>}
                <Text style={styles.infoCellLable}>Index</Text>
            </View>
            <View style={styles.infoCell}>
                {futuresTradeStore.symbolTicker &&
                    <Text style={styles.infoCellValue}>
                        {Math.round(parseFloat(futuresTradeStore.symbolTicker.h) * 10) / 10}
                    </Text>}
                <Text style={styles.infoCellLable}>High</Text>
            </View>
            <View style={styles.infoCell}>
                {futuresTradeStore.symbolTicker &&
                    <Text style={styles.infoCellValue}>
                        {Math.round(parseFloat(futuresTradeStore.symbolTicker.l) * 10) / 10}
                    </Text>}
                <Text style={styles.infoCellLable}>Low</Text>
            </View>
            <View style={styles.infoCell}>
                {futuresTradeStore.markPrice &&
                    <Text style={styles.infoCellValue}>
                        {getTimeDiff(futuresTradeStore.markPrice.T)}
                    </Text>}
                <Text style={styles.infoCellLable}>Funding</Text>
            </View>
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        justifyContent: 'space-between'
    },
    infoCell: {

    },
    infoCellLable: {
        fontSize: 16,
        color: 'rgb(132, 142, 156)',
        textAlign: 'center'
    },
    infoCellValue: {
        fontSize: 18,
        color: 'rgb(234, 236, 239)',
        textAlign: 'center'
    }
})

export default MarketInfo