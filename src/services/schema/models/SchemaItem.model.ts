import { RestMethod } from '@/transporters/rest/types'
import { PokeTransport } from '@/types/PokeTransport'

export type SchemaItem = {
  scope: string
  action: string
  transports: PokeTransport[]
  authRequired: boolean
  restMethods: RestMethod[]
  schema?: unknown
  description?: string
}
