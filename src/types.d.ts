export interface Req {
    data: Data
  }

export interface Data {
  highestSwaps: Swap[]
  lowestSwaps: Swap[]
}

export interface Bundle {
  id: string
  ethPrice: string
}

export interface Swap {
  sender: string
  amountUSD: string
  timestamp: string
  to: string
}
