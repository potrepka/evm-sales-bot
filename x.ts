import { TwitterApi } from 'twitter-api-v2'
import { hyperliquid } from './chains'
import { abbreviateAddress } from './helpers'
import { drip } from './marketplaces'
import type { PostData } from './types'

const BLOCK_EXPLORER_URL = hyperliquid.blockExplorers.default.url.substring(8)
const MARKETPLACE_URL = drip.url.substring(8)

const client = new TwitterApi({
  // FILL THIS IN!
})

export const postOnX = async (data: PostData) => {
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
  const image = data.tokenData.image
  const mediaIds = await Promise.all([client.v1.uploadMedia(image)])
  const {
    data: { id },
  } = await client.v2.tweet({ text, media: { media_ids: mediaIds } })
  console.log(`Posted on X: ${id}`)
}
