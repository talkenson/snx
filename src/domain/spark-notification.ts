import { z } from 'zod'
import { Profile } from '@/domain/profile'
import { Spark } from '@/domain/spark'

const NotificationProfile = Profile.pick({
  id: true,
  age: true,
  name: true,
  avatar: true,
})

export const SparkNotification = z.object({
  id: z.number().int(),
  sparkId: Spark.shape.id,
  profileId: Spark.shape.initiatorId,
  profile: NotificationProfile,
  recipientId: Spark.shape.recipientId,
  recipient: NotificationProfile,
  isRead: z.boolean(),
  createdAt: z.date(),
})

export type SparkNotification = z.infer<typeof SparkNotification>
