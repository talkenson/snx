import { PokeTransports } from '@/types'

type ClientId = string

export type Credentials = {
  userId: number
  login: string
  password: string // Hashed
  refreshChain: Record<ClientId, RefreshTokenChain>
}

export type RefreshTokenChain = {
  token: string
  transport?: PokeTransports
  clientId?: string
}

export const credentialsPrimaryKey = 'userId'
