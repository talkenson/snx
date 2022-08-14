import { z } from 'zod'
import { Profile } from '@/domain/profile'
import { Spark } from '@/domain/spark'

const NotificationProfile = Profile.pick({
  age: true,
  name: true,
})

export const SparkNotification = z.object({
  id: z.number().int(),
  sparkId: Spark.shape.id,
  profile: NotificationProfile,
  isRead: z.boolean(),
  createdAt: z.date(),
})

export type SparkNotification = z.infer<typeof SparkNotification>
