import { PrismaClient } from '@prisma/client'
import { DateTime } from 'luxon'
import { Account } from '@/domain/account'
import { SparkType } from '@/domain/enums/spark-type'
import { Spark, SparkInput } from '@/domain/spark'
import profileCacheStore from '@/services/profile/stores/profileCache.store'

export const sparkRepo = ({ prisma }: { prisma: PrismaClient }) => ({
  async checkIfMutualSparkExists({
    initiatorId,
    recipientId,
  }: Omit<SparkInput, 'sparkType' | 'isSubmitted'>) {
    const spark = await prisma.spark.findUnique({
      where: {
        initiatorId_recipientId: {
          initiatorId,
          recipientId,
        },
      },
    })
    return spark
  },
  async submitSpark(sparkId: Spark['id']) {
    return await prisma.spark.update({
      data: {
        isSubmitted: true,
        submittedAt: DateTime.now().toJSDate(),
      },
      where: {
        id: sparkId,
      },
    })
  },
  async createSpark({
    initiatorId,
    recipientId,
    sparkType,
    isSubmitted,
    submittedAt,
  }: SparkInput) {
    const spark = await prisma.spark.create({
      data: {
        initiatorId,
        recipientId,
        sparkType,
        isSubmitted,
        submittedAt,
      },
    })
    return spark
  },
  async createSparkNotification(
    initiatorId: Spark['initiatorId'],
    sparkId: Spark['id'],
    recipientId: Spark['recipientId'],
  ) {
    return await prisma.sparkNotification.create({
      data: {
        profileId: initiatorId,
        sparkId: sparkId,
        recipientId: recipientId,
      },
    })
  },
  async getProfileId(accountId: Account['id']) {
    return (
      profileCacheStore.get(accountId)?.profileId ||
      (
        await prisma.profile.findUnique({
          where: {
            accountId,
          },
          select: {
            id: true,
          },
        })
      )?.id
    )
  },
})
