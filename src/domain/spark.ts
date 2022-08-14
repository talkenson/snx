import { z } from 'zod'
import { SparkType } from '@/domain/enums/spark-type'
import { Profile } from '@/domain/profile'

export const Spark = z.object({
  id: z.number().int(),
  initiatorId: Profile.shape.id,
  recipientId: Profile.shape.id,
  initiator: Profile,
  recipient: Profile,
  isSubmitted: z.boolean().default(false),
  createdAt: z.date(),
  submittedAt: z.date().optional(),
  sparkType: z.nativeEnum(SparkType),
})

export const SparkInput = z.object({
  initiatorId: Profile.shape.id,
  recipientId: Profile.shape.id,
  sparkType: z.nativeEnum(SparkType),
  isSubmitted: z.boolean().default(false),
  submittedAt: z.date().nullish(),
})

export const SparkCreateInputPayload = z.object({
  recipientId: Profile.shape.id,
  sparkType: z.nativeEnum(SparkType),
})

export type SparkCreateInputPayload = z.infer<typeof SparkCreateInputPayload>
export type SparkInput = z.infer<typeof SparkInput>
export type Spark = z.infer<typeof Spark>
