import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, Text, View, FlatList, ListRenderItem } from 'react-native'
import axios from 'axios'
import Collection from '../../types/CollectionType'
import RnSvg from '../../components/RnSvg'
import Nft from '../../types/NftType'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import Listing from '../../types/Listing'

const headers = {
    "X-API-KEY": "f2e92a5301c34ea590a8f3838dcb973c"
}

const Tab = createMaterialTopTabNavigator()

const CollectionScreen = ({ route }: any) => {
    const collection: Collection = route.params.collection
    const slug = collection.slug
    // const slug = "lil-bulls"

    const [loading, setLoading] = useState(true)

    const [listings, setListings] = useState<Listing[]>([])
    const [nfts, setNfts] = useState<Nft[]>([])


    const fetchListings = async (): Promise<Listing[]> => {
        const res = await axios.get(`https://api.opensea.io/v2/listings/collection/${slug}/all?limit=10`, {
            headers: headers
        })

        const listedNfts: Listing[] = await Promise.all(res.data.listings.map(async (rawlisting: Listing) => {
            const contractAddress = rawlisting.protocol_data.parameters.offer[0].token;
            const tokenId = rawlisting.protocol_data.parameters.offer[0].identifierOrCriteria;
            const url = `https://api.opensea.io/v2/chain/bsc/contract/${contractAddress}/nfts/${tokenId}`;

            const res = await axios.get(url, {
                headers: headers
            });

            rawlisting.nft = res.data.nft;
            return rawlisting;
        }));

        setListings(listedNfts)

        return res.data.listings
    }

    const fetchNfts = async (): Promise<Nft[]> => {
        const res = await axios.get(`https://api.opensea.io/api/v2/collection/${slug}/nfts?limit=10`, {
            headers: headers
        })
        setNfts(res.data.nfts)
        return res.data.nfts
    }


    const initialFetch = () => {
        Promise.all([fetchNfts(), fetchListings()]).then(([_nftsRes, _listingsRes]) => {

            // const listedNFTs = _listingsRes.map(rawlisting => {
            //     const tokenId = rawlisting.protocol_data.parameters.offer[0].identifierOrCriteria;
            //     const nft = _nftsRes.find(nft => nft.identifier === tokenId)
            //     if (nft) {
            //         rawlisting.nft = nft
            //     }
            //     return rawlisting
            // })

            // setNfts(_nftsRes)
            // setListings(listedNFTs)

            setLoading(false)
        }).catch((err) => console.log(err))
    }

    useEffect(() => {
        console.log(slug);
        initialFetch()
    }, [slug])


    const renderNftCard: ListRenderItem<Nft> = ({ item }) => {
        return (
            <View style={styles.collectionCard}>
                <RnSvg url={item.image_url} width={"100%"} height={250} />
                {/* <SvgUri uri={item.image_url} width={"100%"} height={250} /> */}
                <Text style={styles.collectionCardTitle}>{item.name}</Text>
                <Text style={styles.collectionCardTitle}>{item.identifier}</Text>
            </View>
        )
    }


    const renderListingCard: ListRenderItem<Listing> = ({ item }) => {

        const priceInBNB = parseFloat(item.price.current.value) / 10 ** item.price.current.decimals;
        const formattedPrice = priceInBNB.toLocaleString(undefined, { minimumFractionDigits: 2 });

        if (!item.nft) {
            return (
                <View style={{ ...styles.collectionCard, height: 200, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: 'black' }}>No NFT Found</Text>
                </View>
            )
        }
        return (
            <View style={styles.collectionCard}>
                <RnSvg url={item.nft.image_url} width={"100%"} height={250} />
                <Text style={styles.collectionCardTitle}>{item.nft.identifier}</Text>
                <Text style={styles.collectionCardTitle}>{item.nft.name}</Text>
                <Text style={styles.collectionCardTitle}>{`${formattedPrice} : ${item.price.current.currency}`}</Text>
            </View>
        )
    }

    const NftsList = useCallback(() => {

        useEffect(() => {

            return () => {
                console.log("---Nfts Unmounted---");
            }
        }, [])

        return (
            <FlatList
                data={nfts}
                contentContainerStyle={styles.container}
                renderItem={renderNftCard}
                keyExtractor={(_item, index) => `${index}`}
            />
        )
    }, [nfts])

    const ListingsList = useCallback(() => {

        useEffect(() => {

            return () => {
                console.log("---Listings Unmounted---");
            }
        }, [])

        return (
            <FlatList
                data={listings}
                contentContainerStyle={styles.container}
                renderItem={renderListingCard}
                keyExtractor={(_item, index) => `${index}`}
            />
        )
    }, [listings])

    return (
        <Tab.Navigator>
            <Tab.Screen name="NFTs" component={NftsList} />
            <Tab.Screen name="Listings" component={ListingsList} />
        </Tab.Navigator>
    )
}

export default CollectionScreen

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