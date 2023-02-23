import { BigNumber } from 'ethers';
import { NFTType, SellOrBuy } from '../constants/enum';
import { Token } from './blockchain';

export interface SwapApiOrder {
  direction: number;
  erc20Token: string;
  erc20TokenAmount: string;
  erc721Token: string;
  erc721TokenId: string;
  erc721TokenProperties: any[];
  expiry: string;
  fees: any[];
  maker: string;
  nonce: string;
  signature: {
    r: string;
    s: string;
    signatureType: number;
    v: number;
  };
  taker: string;
}

export interface OrderBookItem {
  erc20Token: string;
  erc20TokenAmount: string;
  nftToken: string;
  nftTokenId: string;
  nftTokenAmount: string;
  nftType: NFTType;
  sellOrBuyNft: SellOrBuy;
  chainId: string;
  order: SwapApiOrder;
  orders?: SwapApiOrder[];
  asset?: Asset;
  token?: Token;
}

export interface Collection {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  imageUrl?: string;
  nftType?: NFTType;
  description?: string;
  syncStatus?: string;
  syncedAssets?: number;
  traitCounts?: string;
  totalSupply?: number;
}

export interface CollectionAPI {
  chainId: number;
  networkId: string;
  name: string;
  imageUrl?: string;
  address: string;
  protocol: string;
  description?: string;
  syncStatus?: string;
  syncedAssets?: number;
  symbol: string;
  traitCounts?: string;
  totalSupply?: number;
}

export interface AssetBalance {
  balance?: BigNumber;
  asset: Asset;
}

export interface HiddenAsset {
  id: string;
  chainId: number;
  contractAddress: string;
}


export interface Asset {
  id: string;
  chainId: number;
  contractAddress: string;
  owner?: string;
  tokenURI: string;
  collectionName: string;
  symbol: string;
  type?: string;
  metadata?: AssetMetadata;
  protocol?: 'ERC1155' | 'ERC721';
}

export interface AssetMetadata {
  name: string;
  image?: string;
  description?: string;
  animation_url?: string;
  attributes?: {
    display_type?: string;
    trait_type: string;
    value: string;
  }[];
}
export type AssetAPI = {
  id: number
  createdAt: Date
  updatedAt: Date
  tokenId: string
  name: string | null
  collectionName: string | null
  symbol: string | null
  address: string
  networkId: string
  chainId: number | null
  imageUrl: string | null
  tokenURI: string | null
  rawData: string | null
  description: string | null
  protocol?: 'ERC1155' | 'ERC721';
  spamInfo?: any
}