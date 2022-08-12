import { z } from 'zod'
import { Profile } from '@/domain/profile'

const Card = Profile.omit({
  contacts: true,
})

export type Card = z.infer<typeof Card>
