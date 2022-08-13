import { prisma } from '@/db'

export const getToken = (accountId: number, clientId: string) =>
  prisma.refreshTokenRecord.findUnique({
    where: {
      accountId_clientId: {
        accountId,
        clientId,
      },
    },
  })
