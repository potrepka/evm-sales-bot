import {
  createPublicClient,
  getContract,
  http,
  type Hash,
  type Log,
} from 'viem'
import { nftAbi } from './abi/nft'
import { hyperliquid } from './chains'
import { ContractEvent } from './events'
import { downloadImage } from './helpers'
import { drip } from './marketplaces'
import type { BidAcceptedLog, ItemSoldLog, PostData, TokenData } from './types'
import { checkAuthOnX, postOnX } from './x'

const client = createPublicClient({
  chain: hyperliquid,
  transport: http(),
})

checkAuthOnX()

const post = async (data: PostData) => {
  postOnX(data)
}

const getTokenData = async (nftAddress: Hash, tokenId: bigint) => {
  const contract = getContract({
    address: nftAddress,
    abi: nftAbi,
    client,
  })
  const uri = (await contract.read.tokenURI?.([tokenId])) as string
  const response = await fetch(uri)
  const json = await response.json()
  return json as TokenData
}

const onLogs = (logs: Log[]) => {
  logs.forEach(async (log) => {
    const eventLog = log as BidAcceptedLog | ItemSoldLog
    const args = eventLog.args
    const tokenData = await getTokenData(
      args.nftAddress as Hash,
      args.tokenId as bigint,
    )
    const imageData = await downloadImage(tokenData.image)
    const data = {
      nftAddress: args.nftAddress as Hash,
      tokenId: args.tokenId as bigint,
      tokenData,
      imageData,
      pricePerItem: args.pricePerItem as bigint,
      paymentToken: 'HYPE',
      buyer: ((log as BidAcceptedLog).args.bidder ||
        (log as ItemSoldLog).args.buyer) as Hash,
      seller: args.seller as Hash,
      transactionHash: log.transactionHash as Hash,
    }
    post(data)
  })
}

client.watchContractEvent({
  address: drip.contractAddress,
  abi: drip.abi,
  eventName: ContractEvent.BidAccepted,
  args: {
    nftAddress: process.env.NFT_CONTRACT_ADDRESS,
  },
  onLogs,
})

client.watchContractEvent({
  address: drip.contractAddress,
  abi: drip.abi,
  eventName: ContractEvent.ItemSold,
  args: {
    nftAddress: process.env.NFT_CONTRACT_ADDRESS,
  },
  onLogs,
})
