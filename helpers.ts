export const abbreviateAddress = (address: string) =>
  `${address.substring(0, 6)}...${address.substring(38)}`
