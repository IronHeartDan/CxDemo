import Nft from "./NftType";

type Listing = {
    nft: Nft | null;
    order_hash: string;
    chain: string;
    type: string;
    price: {
        current: {
            currency: string;
            decimals: number;
            value: string;
        };
    };
    protocol_data: {
        parameters: {
            offerer: string;
            offer: {
                itemType: number;
                token: string;
                identifierOrCriteria: string;
                startAmount: string;
                endAmount: string;
            }[];
            consideration: {
                itemType: number;
                token: string;
                identifierOrCriteria: string;
                startAmount: string;
                endAmount: string;
                recipient: string;
            }[];
            startTime: string;
            endTime: string;
            orderType: number;
            zone: string;
            zoneHash: string;
            salt: string;
            conduitKey: string;
            totalOriginalConsiderationItems: number;
            counter: number;
        };
        signature: null;
    };
    protocol_address: string;
}

export default Listing;