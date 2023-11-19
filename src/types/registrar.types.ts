import { PrismaClient } from '@prisma/client'
import { EventBus } from '@/types/controllerRelated.types'

export type RegistrarInjection = {
  prisma: PrismaClient
  bus: EventBus
}
