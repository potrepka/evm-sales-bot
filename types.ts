import type { AbiEvent } from 'abitype'
import type { Hash, Log } from 'viem'

export type BidAcceptedEvent = AbiEvent & {
  name: 'BidAccepted'
  type: 'event'
  inputs: [
    { name: 'seller'; type: 'address'; indexed: false },
    { name: 'bidder'; type: 'address'; indexed: false },
    { name: 'nftAddress'; type: 'address'; indexed: false },
    { name: 'tokenId'; type: 'uint256'; indexed: false },
    { name: 'quantity'; type: 'uint64'; indexed: false },
    { name: 'pricePerItem'; type: 'uint128'; indexed: false },
    { name: 'paymentToken'; type: 'address'; indexed: false },
    { name: 'bidType'; type: 'uint8'; indexed: false },
  ]
}

export type BidAcceptedLog = Log<bigint, number, boolean, BidAcceptedEvent>

export type ItemSoldEvent = AbiEvent & {
  name: 'ItemSold'
  type: 'event'
  inputs: [
    { name: 'seller'; type: 'address'; indexed: false },
    { name: 'buyer'; type: 'address'; indexed: false },
    { name: 'nftAddress'; type: 'address'; indexed: false },
    { name: 'tokenId'; type: 'uint256'; indexed: false },
    { name: 'quantity'; type: 'uint64'; indexed: false },
    { name: 'pricePerItem'; type: 'uint128'; indexed: false },
    { name: 'paymentToken'; type: 'address'; indexed: false },
  ]
}

export type ItemSoldLog = Log<bigint, number, boolean, ItemSoldEvent>

export type TokenAttribute = {
  trait_type: string
  value: string
}

export type TokenData = {
  name: string
  description: string
  image: string
  attributes: TokenAttribute[]
}

export type PostData = {
  nftAddress: Hash
  tokenId: bigint
  tokenData: TokenData
  pricePerItem: bigint
  paymentToken: string
  buyer: Hash
  seller: Hash
  transactionHash: Hash
}
