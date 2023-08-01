import { View, Text } from 'react-native'
import React, { useCallback } from 'react'
import { Tabs } from 'react-native-collapsible-tab-view'

const DemoUI = () => {

    const data = Array.from({ length: 50 }).fill(0)

    const header = useCallback(() => {
        return (
            <View style={{ height: 500, alignItems: 'center', justifyContent: 'center' }}>
                <Text>Header</Text>
            </View>
        )
    }, [])

    const renderItem = useCallback(({ item, index }: any) => {
        return (
            <Text>{index}</Text>
        )
    }, [data])
    return (
        <Tabs.Container
            renderHeader={header}
        >
            <Tabs.Tab name='A'>
                <Tabs.FlatList
                    data={data}
                    renderItem={renderItem}
                />
            </Tabs.Tab>
            <Tabs.Tab name='B'>
                <Tabs.FlatList
                    data={data}
                    renderItem={renderItem}
                />
            </Tabs.Tab>
        </Tabs.Container>
    )
}

export default DemoUI