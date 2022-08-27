import { z } from 'zod'
import { RawPassword } from '@/domain/password'
import { Profile } from '@/domain/profile'
import { RefreshTokenRecord } from '@/domain/refreshTokenRecord'

const literalSchema = z.union([z.string(), z.number(), z.boolean()])
type Literal = z.infer<typeof literalSchema>
type Json = Literal | { [key: string]: Json } | Json[]
const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]),
)

export enum AccountOrigin {
  Local = 'Local',
  VK = 'VK',
}

export const Account = z.object({
  id: z.number().int(),
  email: z.string().email().nullish(),
  password: RawPassword,
  refreshChains: z.array(RefreshTokenRecord),
  profile: Profile.optional().nullish(),
  origin: z.nativeEnum(AccountOrigin).default(AccountOrigin.Local),
  externalId: z.number().int().nullish(),
})

export type Account = z.infer<typeof Account>
