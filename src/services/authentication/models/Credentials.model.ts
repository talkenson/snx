import { PokeTransport } from '@/types/PokeTransport'

type ClientId = string

export type Credentials = {
  userId: number
  login: string
  password: string // Hashed
  refreshChain: Record<ClientId, RefreshTokenChain>
}

export type RefreshTokenChain = {
  token: string
  transport?: PokeTransport
  clientId?: string
}

export const credentialsPrimaryKey = 'userId'
