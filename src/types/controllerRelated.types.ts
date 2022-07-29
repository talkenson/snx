import { Router } from 'express'
import { Server } from 'socket.io'
import { User } from '@/services/users/models/User.model'
import { BrokerSubscription } from '@/transporters/broker/types'
import { PokeTransport } from '@/types/PokeTransport'
import { AddListenerFunction } from '@/types/listenerRelated.types'

export type ControllerContext<
  T extends Record<string, unknown> = Record<string, unknown>,
> = {
  user: User | undefined
  event: string
  authRequired?: boolean
  transport: PokeTransport
  clientId: string
} & T

export type InvalidationFunction = () => void

export type ControllerRegisterer = (
  addListener: AddListenerFunction,
  helpers?: any,
) => InvalidationFunction | void

export type Controller = {
  scope: string
  transport?: PokeTransport[]
  requireAuth?: boolean
  register: ControllerRegisterer
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
