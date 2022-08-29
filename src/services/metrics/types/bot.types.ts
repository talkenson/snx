export type BotStartInput = {
  id: number
  name: string
  username?: string
}

export type BotStart = {
  createdAt: number
  id: number
} & BotStartInput

export type BotSubscribeInput = {
  id: number
  name: string
  username?: string
}

export type BotSubscribe = {
  createdAt: number
  id: number
} & BotSubscribeInput
