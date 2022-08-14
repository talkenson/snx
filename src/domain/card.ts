import { z } from 'zod'
import { ProfileInput } from '@/domain/profile'

export const Card = ProfileInput.omit({
  contacts: true,
})

export const GetCardsPayload = z.object({
  count: z.number().int().min(5).max(20).optional(),
})

export type GetCardsPayload = z.infer<typeof GetCardsPayload>
export type Card = Omit<ProfileInput, 'contacts'>
