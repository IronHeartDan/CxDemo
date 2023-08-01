type Nft = {
    identifier: string;
    collection: string;
    contract: string;
    token_standard: string;
    name: string;
    description: null | string;
    image_url: string;
    metadata_url: string;
    created_at: string;
    updated_at: string;
    is_disabled: boolean;
    is_nsfw: boolean;
  };


  export default Nft;