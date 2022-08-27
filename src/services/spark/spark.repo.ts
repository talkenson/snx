import { PrismaClient } from '@prisma/client'
import { DateTime } from 'luxon'
import { Account } from '@/domain/account'
import { Spark, SparkInput } from '@/domain/spark'

export const sparkRepo = ({ prisma }: { prisma: PrismaClient }) => ({
  async checkIfMutualSparkExists({
    initiatorId,
    recipientId,
  }: Omit<SparkInput, 'sparkType' | 'isSubmitted'>) {
    return await prisma.spark.findUnique({
      where: {
        initiatorId_recipientId: {
          initiatorId,
          recipientId,
        },
      },
    })
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
    return await prisma.spark.create({
      data: {
        initiatorId,
        recipientId,
        sparkType,
        isSubmitted,
        submittedAt,
      },
    })
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
      await prisma.profile.findUnique({
        where: {
          accountId,
        },
        select: {
          id: true,
        },
      })
    )?.id
  },
})
