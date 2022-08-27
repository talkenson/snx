import { PrismaClient } from '@prisma/client'
import { Account } from '@/domain/account'
import { SparkType } from '@/domain/enums/spark-type'

export const likesRepo = ({ prisma }: { prisma: PrismaClient }) => ({
  async getLikes({
    profileId,
    take = 10,
    page = 1,
  }: {
    profileId: number
    take?: number
    page?: number
  }) {
    return await prisma.spark.findMany({
      where: {
        recipientId: profileId,
        sparkType: SparkType.Like,
      },
      include: {
        initiator: true,
      },
      orderBy: {
        id: 'desc',
      },
      take: take,
      skip: page * take,
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
