import { DateTime } from 'luxon'
import { z } from 'zod'
import { Account } from '@/domain/account'

export const RefreshTokenRecord = z.object({
  id: z.number().int(),
  accountId: z.number().int(),
  //account: Account,
  clientId: z.string().min(1, 'Empty Client ID'),
  token: z.string(),
  issuedAt: z.date().default(() => DateTime.now().toJSDate()),
})

export type RefreshTokenRecord = z.infer<typeof RefreshTokenRecord> & {
  account: Account
}
