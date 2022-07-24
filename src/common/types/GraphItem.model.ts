import { PokeTransports } from '@/types'

export type GraphItem = {
  scope: string
  action: string
  transports: PokeTransports[]
  authRequired: boolean
  schema?: unknown
  description?: string
}
