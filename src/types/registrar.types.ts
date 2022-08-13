import { PrismaClient } from '@prisma/client'

export type RegistrarInjection = {
  prisma: PrismaClient
}
