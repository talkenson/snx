import { PrismaClient } from '@prisma/client'
import { Profile } from '@/domain/profile'
import profileCacheStore from '@/services/profile/stores/profileCache.store'
import { Account } from '@/domain/account'

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
    const createdProfile = await prisma.profile.create({
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
    profileCacheStore.insert(createdProfile.accountId, {
      accountId: createdProfile.accountId,
      profileId: createdProfile.id,
    })
    return createdProfile
  },
  async patchProfile(
    accountId: Account['id'],
    data: Partial<Omit<Profile, 'id' | 'accountId'>>,
  ) {
    const updatedProfile = await prisma.profile.update({
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
    return updatedProfile
  },
  async getProfile(profileId: Profile['id']) {
    return await prisma.profile.findUnique({
      where: {
        id: profileId,
      },
      include: {
        work: true,
        contacts: true,
        graduate: true,
      },
    })
  },
})
