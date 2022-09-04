import { PrismaClient } from '@prisma/client'
import { BrokerMakeRequest } from '@/transporters/broker/types'

export type RegistrarInjection = {
  prisma: PrismaClient
  makeRequest: BrokerMakeRequest
}
