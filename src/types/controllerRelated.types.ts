import { PrismaClient } from '@prisma/client'
import { Router } from 'express'
import { Server } from 'socket.io'
import { Account } from '@/domain/account'
import { Profile } from '@/domain/profile'
import {
  BrokerExported,
  BrokerMakeRequest,
  BrokerSubscription,
} from '@/transporters/broker/types'
import { PokeTransport } from '@/types/PokeTransport'
import { AddListenerFunction } from '@/types/listenerRelated.types'

export type ControllerContext<
  T extends Record<string, unknown> = Record<string, unknown>,
> = {
  userId?: Account['id']
  event: string
  authRequired?: boolean
  transport: PokeTransport
  clientId: string
} & T

export type InvalidationFunction = () => void

export type ControllerRegisterer<RepositoryType> = (
  addListener: AddListenerFunction,
  repository: RepositoryType,
  makeRequest: BrokerMakeRequest,
) => InvalidationFunction | void

export type ControllerSetup<RepositoryType> = (
  repository: RepositoryType,
) => Promise<InvalidationFunction | void>

export type DefaultRepositoryType = Record<string, CallableFunction>

export type RepositoryBuilder<T extends DefaultRepositoryType | undefined> =
  (dbProvider: { prisma: PrismaClient }) => T

export type Controller<
  RepositoryType extends DefaultRepositoryType | undefined = undefined,
> = {
  scope: string
  transport?: PokeTransport[]
  requireAuth?: boolean
  repository?: RepositoryBuilder<RepositoryType>
  register: ControllerRegisterer<RepositoryType>
  setup?: ControllerSetup<RepositoryType>
}

export type RegistrarTypedParameterSet<T extends PokeTransport> = T extends 'ws'
  ? { io: Server }
  : T extends 'rest'
  ? { router: Router }
  : T extends 'broker'
  ? { initializer: () => Promise<BrokerExported> }
  : never

export type ControllerRegistrarParameters = {
  [transport in PokeTransport]: RegistrarTypedParameterSet<transport>
}
