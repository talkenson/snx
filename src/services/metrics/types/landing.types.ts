export type LandingOpenInput = {
  ua?: string
}

export type LandingOpen = {
  createdAt: number
  id: number
} & LandingOpenInput

export type ButtonClickInput = {
  delay?: number
}

export type ButtonClick = {
  createdAt: number
  id: number
} & ButtonClickInput
