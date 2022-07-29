import { PokeTransports, RestMethod } from '@/types'

export type GraphItem = {
  scope: string
  action: string
  transports: PokeTransports[]
  authRequired: boolean
  restMethods: RestMethod[]
  schema?: unknown
  description?: string
}
