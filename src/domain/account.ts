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

export const Account = z.object({
  id: z.number().int(),
  email: z.string().email(),
  password: RawPassword,
  refreshChains: z.array(RefreshTokenRecord),
  profile: Profile.optional().nullish(),
})

export type Account = z.infer<typeof Account>
