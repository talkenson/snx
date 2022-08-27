import { PrismaClient } from '@prisma/client'
import { Account } from '@/domain/account'
import { Profile } from '@/domain/profile'

export const profileRepo = ({ prisma }: { prisma: PrismaClient }) => ({
  async checkIfProfileExists(accountId: Account['id']) {
    return !!(await prisma.profile.count({
      where: {
        accountId,
      },
    }))
  },
  async createProfile(
    accountId: Account['id'],
    data: Omit<Profile, 'id' | 'accountId'>,
  ) {
    return await prisma.profile.create({
      data: {
        ...data,
        accountId: accountId,
      },
      include: {
        work: true,
        contacts: true,
        graduate: true,
      },
    })
  },
  async patchProfile(
    accountId: Account['id'],
    data: Partial<Omit<Profile, 'id' | 'accountId'>>,
  ) {
    return await prisma.profile.update({
      data: {
        ...data,
        work: data.work
          ? {
              upsert: {
                update: { ...data.work },
                create: { ...data.work, position: data.work?.position || '' },
              },
            }
          : undefined,
        graduate: data.graduate
          ? {
              upsert: {
                update: { ...data.graduate },
                create: { ...data.graduate },
              },
            }
          : undefined,
        contacts: data.contacts
          ? {
              upsert: {
                update: { ...data.contacts },
                create: { ...data.contacts },
              },
            }
          : undefined,
      },
      where: { accountId },
      include: {
        work: true,
        contacts: true,
        graduate: true,
      },
    })
  },
  async getProfile(accountId: Account['id']) {
    return await prisma.profile.findUnique({
      where: {
        accountId: accountId,
      },
      include: {
        work: true,
        contacts: true,
        graduate: true,
      },
    })
  },
  async getProfileWithAllExtras(accountId: Account['id']) {
    return await prisma.profile.findUnique({
      where: {
        accountId: accountId,
      },
      include: {
        work: true,
        contacts: true,
        graduate: true,
        notifications: {
          where: {
            isRead: false,
          },
          select: {
            profile: {
              select: {
                name: true,
                age: true,
                avatar: true,
              },
            },
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })
  },
  async mock() {
    /*const createdAccounts = await prisma.account.createMany({
      data: Array.from({ length: 100 }, () => ({
        email: faker.internet.email(),
        password: faker.internet.password(10),
      })),
    })*/
    /*const createdProfiles = await prisma.profile.createMany({
      data: mockPersons.map((p, i) => ({ ...p, accountId: 6 + i })),
    })
    return createdProfiles*/
    //return createdAccounts
  },
})
