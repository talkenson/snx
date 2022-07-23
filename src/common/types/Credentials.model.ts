import { PokeTransports } from '@/types'

export type Credentials = {
  userId: number
  login: string
  password: string // Hashed
  refreshToken: string
}

export type RefreshTokenChain = {
  token: string
  transport: PokeTransports
  deviceId?: string
  clientId: string
}

export const credentialsPrimaryKey = 'userId'
