import Bottleneck from 'bottleneck'
import { fileTypeFromBuffer } from 'file-type'
import { EUploadMimeType, TwitterApi } from 'twitter-api-v2'
import { hyperliquid } from './chains'
import { abbreviateAddress, getMaximum } from './helpers'
import { drip } from './marketplaces'
import type { PostData } from './types'

const BLOCK_EXPLORER_URL = hyperliquid.blockExplorers.default.url.substring(8)
const MARKETPLACE_URL = drip.url.substring(8)

const queue: PostData[] = []

const client = new TwitterApi({
  // @ts-ignore
  appKey: process.env.X_API_KEY,
  appSecret: process.env.X_API_SECRET,
  accessToken: process.env.X_ACCESS_TOKEN,
  accessSecret: process.env.X_ACCESS_SECRET,
})

const readWriteClient = client.readWrite

const getUsername = async () => {
  const {
    data: { username },
  } = await readWriteClient.currentUserV2()
  return username
}

const checkAuthOnX = async () => {
  const username = await getUsername()
  console.log('Authenticated:', `https://x.com/${username}`)
}

const addToQueue = (data: PostData) => queue.push(data)

const buildText = (data: PostData) => {
  const name = data.tokenData.name
  const price = Number(data.pricePerItem / BigInt(1e15)) / 1e3
  const unit = data.paymentToken
  const seller = abbreviateAddress(data.seller)
  const buyer = abbreviateAddress(data.buyer)
  const transactionLink = `${BLOCK_EXPLORER_URL}/tx/${data.transactionHash}`
  const mention = `@${process.env.NFT_X_USERNAME}`
  const collectionLink = `${MARKETPLACE_URL}/collections/${process.env.NFT_MARKETPLACE_USERNAME}`
  const lines = [
    `🚨 ${name} was bought for 💰 ${price} $${unit}`,
    '',
    `Seller: ${seller}`,
    `Buyer: ${buyer}`,
    '',
    `🔗 ${transactionLink}`,
    '',
    mention,
    collectionLink,
  ]
  return lines.join('\n')
}

const uploadMedia = async (data: PostData) => {
  const fileTypeResult = await fileTypeFromBuffer(data.imageData)
  const mimeType = fileTypeResult?.mime || EUploadMimeType.Png
  return await client.v1.uploadMedia(data.imageData, { mimeType })
}

const post = async () => {
  const data = getMaximum(queue)
  if (!data) {
    return
  }
  queue.length = 0
  const text = buildText(data)
  const mediaId = await uploadMedia(data)
  const {
    data: { id },
  } = await readWriteClient.v2.tweet({
    text,
    media: { media_ids: [mediaId] },
  })
  const username = await getUsername()
  console.log('Posted on X:', `https://x.com/${username}/status/${id}`)
}

const limiter = new Bottleneck({
  minTime: Number(process.env.X_RATE_LIMIT_INTERVAL),
  highWater: 1,
})

const postLimited = limiter.wrap(post)

const postOnX = (data: PostData) => {
  addToQueue(data)
  postLimited()
}

export { checkAuthOnX, postOnX }
