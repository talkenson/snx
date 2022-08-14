import { Server, Socket } from 'socket.io'
import { Profile } from '@/domain/profile'
import { User } from '@/services/profile/models/User.model'
import { Controller, ControllerContext } from '@/types/controllerRelated.types'
import {
  EventName,
  ListenerFunction,
  ListenerWrapper,
} from '@/types/listenerRelated.types'

export type EventDrivenListenerFunction = (
  context: ControllerContext,
) => (
  hash: string,
  ...payload: unknown[]
) => ReturnType<ReturnType<ListenerFunction>>

export type EventListenerMap = Map<
  EventName,
  ListenerWrapper<EventDrivenListenerFunction>
>

export type ForeignContext = {
  userId?: number
  clientId: string
  profileId?: number
  profile?: Profile
}

export type EventControllerRegistrar = (
  io: Server,
  socket: Socket,
  foreignContext: ForeignContext,
) => (controllers: Controller[]) => Promise<void>
