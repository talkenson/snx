import { Router } from 'express'
import { Server } from 'socket.io'
import { User } from '@/services/profile/models/User.model'
import { BrokerSubscription } from '@/transporters/broker/types'
import { PokeTransport } from '@/types/PokeTransport'
import { AddListenerFunction } from '@/types/listenerRelated.types'
import { PrismaClient } from '@prisma/client'
import { Account } from '@/domain/account'
import { Profile } from '@/domain/profile'

export type ControllerContext<
  T extends Record<string, unknown> = Record<string, unknown>,
> = {
  userId?: Account['id']
  profileId?: Profile['id']
  event: string
  authRequired?: boolean
  transport: PokeTransport
  clientId: string
} & T

export type InvalidationFunction = () => void

export type ControllerRegisterer<RepositoryType> = (
  addListener: AddListenerFunction,
  repository: RepositoryType,
) => InvalidationFunction | void

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
}

export type RegistrarTypedParameterSet<T extends PokeTransport> = T extends 'ws'
  ? { io: Server }
  : T extends 'rest'
  ? { router: Router }
  : T extends 'broker'
  ? { subscription: BrokerSubscription }
  : never

export type ControllerRegistrarParameters = {
  [transport in PokeTransport]: RegistrarTypedParameterSet<transport>
}
