import { PrismaClient } from '@prisma/client'
import { Account, AccountOrigin } from '@/domain/account'

export type CreateAccountPayload<O extends AccountOrigin> = Pick<
  Account,
  'origin'
> &
  (O extends AccountOrigin.Local
    ? Required<Pick<Account, 'email' | 'password'>>
    : O extends AccountOrigin.VK
    ? Required<Pick<Account, 'externalId'>>
    : never)

export const authenticationRepo = ({ prisma }: { prisma: PrismaClient }) => ({
  async checkIfEmailExists(email: Account['email']) {
    return !!(await prisma.account.count({
      where: {
        email,
      },
    }))
  },
  async createAccount(data: CreateAccountPayload<AccountOrigin>) {
    return await prisma.account.create({
      data:
        data.origin === AccountOrigin.Local
          ? (data as Pick<Account, 'origin' | 'email' | 'password'>)
          : ({ ...data, password: `integrated_over_${data.origin}` } as Pick<
              Account,
              'origin' | 'externalId' | 'password'
            >),
    })
  },
  async findUser(email: NonNullable<Account['email']>) {
    return prisma.account.findUnique({
      where: {
        origin_email: {
          email: email,
          origin: AccountOrigin.Local,
        },
      },
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
  async findUserByOrigin(
    origin: Account['origin'],
    externalId: NonNullable<Account['externalId']>,
  ) {
    return prisma.account.findUnique({
      where: {
        origin_externalId: {
          origin: AccountOrigin.VK,
          externalId: externalId,
        },
      },
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
    return prisma.account.findUnique({
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
