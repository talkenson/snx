import { PrismaClient } from '@prisma/client'
import { Account } from '@/domain/account'
import { RepositoryComplexData } from '@/types/database.types'

export const authenticationRepo = ({ prisma }: { prisma: PrismaClient }) => ({
  async checkIfEmailExists(email: Account['email']) {
    return !!(await prisma.account.count({
      where: {
        email,
      },
    }))
  },
  async createAccount(data: Pick<Account, 'email' | 'password'>) {
    return await prisma.account.create({
      data: data,
    })
  },
  async findUser(email: Account['email']) {
    return prisma.account.findFirst({
      where: { email: email },
      include: {
        profile: {
          include: {
            work: true,
            contacts: true,
            graduate: true,
          },
        },
      },
    })
  },
  async getAccountById(id: Account['id']) {
    return prisma.account.findFirst({
      where: { id: id },
      include: {
        profile: {
          include: {
            work: true,
            contacts: true,
            graduate: true,
          },
        },
      },
    })
  },
  async getAccountByIdWithCommonClientToken(
    id: Account['id'],
    clientId: string,
  ) {
    return prisma.account.findFirst({
      where: { id: id },
      include: {
        profile: {
          include: {
            work: true,
            contacts: true,
            graduate: true,
          },
        },
        refreshChains: {
          where: {
            clientId,
          },
        },
      },
    })
  },
  async refreshTokenUpdater(
    accountId: Account['id'],
    clientId: string,
    newToken: string,
  ) {
    return prisma.refreshTokenRecord.upsert({
      where: {
        accountId_clientId: {
          accountId,
          clientId,
        },
      },
      update: {
        token: newToken,
      },
      create: {
        token: newToken,
        accountId,
        clientId,
      },
    })
  },
})
