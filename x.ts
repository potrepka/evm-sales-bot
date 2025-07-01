import Bottleneck from 'bottleneck'
import { EUploadMimeType, TwitterApi } from 'twitter-api-v2'
import { hyperliquid } from './chains'
import { abbreviateAddress } from './helpers'
import { drip } from './marketplaces'
import type { PostData } from './types'

const BLOCK_EXPLORER_URL = hyperliquid.blockExplorers.default.url.substring(8)
const MARKETPLACE_URL = drip.url.substring(8)

const client = new TwitterApi({
  // @ts-ignore
  consumerToken: process.env.API_KEY,
  consumerSecret: process.env.API_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_SECRET,
})

const readWriteClient = client.readWrite

const post = async (data: PostData) => {
  const name = data.tokenData.name
  const price = Number(data.pricePerItem / BigInt(1e15)) / 1e3
  const unit = data.paymentToken
  const seller = abbreviateAddress(data.seller)
  const buyer = abbreviateAddress(data.buyer)
  const transactionLink = `${BLOCK_EXPLORER_URL}/tx/${data.transactionHash}`
  const username = `@${process.env.NFT_X_USERNAME}`
  const collectionLink = `${MARKETPLACE_URL}/collections/${process.env.NFT_DRIP_USERNAME}`
  const lines = [
    `🚨 ${name} just sold! 🚨`,
    '',
    `Price: ${price} ${unit}`,
    `Seller: ${seller}`,
    `Buyer: ${buyer}`,
    '',
    `🔗 ${transactionLink}`,
    '',
    username,
    collectionLink,
  ]
  const text = lines.join('\n')
  const mediaId = await client.v1.uploadMedia(data.imageData, {
    mimeType: EUploadMimeType.Png,
  })
  const {
    data: { id },
  } = await readWriteClient.v2.tweet({
    text,
    media: { media_ids: [mediaId] },
  })
  const xLink = `https://x.com/${process.env.X_USERNAME}/status/${id}`
  console.log(`Posted on X: ${xLink}`)
}

const limiter = new Bottleneck({
  minTime: Number(process.env.X_RATE_LIMIT_INTERVAL),
})

export const postOnX = limiter.wrap((data: PostData) => post(data))
