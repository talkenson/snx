import { z } from 'zod'
import { SparkType } from '@/domain/enums/spark-type'
import { Profile } from '@/domain/profile'

export const Spark = z.object({
  id: z.number().int(),
  initiator: Profile.shape.id,
  recipient: Profile.shape.id,
  isSubmitted: z.boolean().default(false),
  createdAt: z.date(),
  submittedAt: z.date().optional(),
  type: z.nativeEnum(SparkType),
})

export type Spark = z.infer<typeof Spark>
