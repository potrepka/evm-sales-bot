export const abbreviateAddress = (address: string) =>
  `${address.substring(0, 6)}...${address.substring(38)}`

export const downloadImage = async (imageUrl: string) => {
  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error(
      `Could not download image (${response.status}): ${imageUrl}`,
    )
  }
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
