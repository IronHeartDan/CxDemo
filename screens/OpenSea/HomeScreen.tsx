import React, { useEffect, useState, useCallback } from 'react'
import { StyleSheet, Text, View, FlatList, TouchableNativeFeedback, ListRenderItem } from 'react-native'
import axios from 'axios'
import { NavigationProp } from '@react-navigation/native'
import RnSvg from '../../components/RnSvg'
import Collection from '../../types/CollectionType'

const headers = {
    "X-API-KEY": "f2e92a5301c34ea590a8f3838dcb973c"
}

const listingsURL = "https://api.opensea.io/v2/orders/bsc/seaport/listings"
const collectionsURL = "https://api.opensea.io/api/v1/collections"

type HomeScreenProps = {
    navigation: NavigationProp<any, any>;
};

const HomeScreen = ({ navigation }: HomeScreenProps) => {

    const [loading, setLoading] = useState(true)

    const [collections, setCollections] = useState<Collection[]>([]);

    const fetchCollections = useCallback(async () => {
        setLoading(true)
        const _collections: Collection[] = []

        const res = await axios.get(listingsURL, {
            headers: headers
        })

        const orders = res.data.orders || []

        for (let i = 0; i < orders.length; i++) {
            const assets = orders[i].maker_asset_bundle.assets;

            for (let j = 0; j < assets.length; j++) {
                const collection = assets[j].collection;
                const exists = _collections.some(item => item.slug === collection.slug);

                if (!exists) {
                    _collections.push(collection)
                }
            }
        }

        setCollections(_collections)
        setLoading(false)
    }, [])




    useEffect(() => {
        fetchCollections()
    }, [])


    const renderCollectionCard: ListRenderItem<Collection> = ({ item }) => {
        const url = item.featured_image_url ?? item.image_url ?? item.large_image_url ?? item.banner_image_url

        return (
            <TouchableNativeFeedback onPress={() => {
                navigation.navigate("collection-details", {
                    collection: item
                })
            }}>
                <View style={styles.collectionCard}>
                    {url && <RnSvg url={url} width={"100%"} height={250} />}
                    <Text style={styles.collectionCardTitle}>{item.slug}</Text>
                </View>
            </TouchableNativeFeedback>
        )
    }

    return (
        <FlatList
            data={collections}
            contentContainerStyle={styles.container}
            renderItem={renderCollectionCard}
            keyExtractor={(_item, index) => `${index}`}
            refreshing={loading}
            onRefresh={fetchCollections}
        />
    )
}

export default HomeScreen

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 10
    },
    collectionCard: {
        backgroundColor: 'white',
        elevation: 5,
        marginVertical: 10,
        borderRadius: 10,
        overflow: 'hidden'
    },
    collectionCardTitle: {
        color: 'black',
        fontWeight: 'bold',
        padding: 10
    }
})