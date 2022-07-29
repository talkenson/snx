import { Response, Router } from 'express'
import { Msg, Subscription } from 'nats'
import { Server, Socket } from 'socket.io'
import { GraphItem } from '@/common/types/GraphItem.model'
import { User } from '@/models/User.model'

export type RestMethod =
  | 'GET'
  | 'POST'
  | 'DELETE'
  | 'PATCH'
  | 'PUT'
  | 'OPTIONS'
  | 'HEAD'
  | 'ALL'

export type EventName = string

export type ListenerMetadata = {
  eventName: EventName
  transports?: PokeTransports[]
  schema?: unknown
  description?: string
  requireAuth?: boolean
  restMethods?: RestMethod[]
}

export type AddListenerFirstArgument = EventName | ListenerMetadata

export type ListenerFunction<Props = any> = (
  resolve: (...result: unknown[]) => void,
  reject: (...reason: unknown[]) => void,
  context: ControllerContext,
) => (...payload: Props[]) => void

export type EventDrivenListenerFunction = (
  context: ControllerContext,
) => (
  hash: string,
  ...payload: unknown[]
) => ReturnType<ReturnType<ListenerFunction>>

export type RestResponse = Response<any, Record<string, any>>

export type RestDrivenListenerFunction = (
  context: ControllerContext,
) => (
  res: RestResponse,
  ...payload: any[]
) => ReturnType<ReturnType<ListenerFunction>>

export type BrokerDrivenListenerFunction = (
  context: ControllerContext,
) => (
  hash: string,
  ...payload: any[]
) => ReturnType<ReturnType<ListenerFunction>>

type AnySourceDrivenListenerFunction =
  | EventDrivenListenerFunction
  | RestDrivenListenerFunction
  | BrokerDrivenListenerFunction

export type ListenerWrapperOptions<T extends AnySourceDrivenListenerFunction> =
  T extends RestDrivenListenerFunction
    ? {
        restMethods: RestMethod[]
      }
    : never

export type ListenerWrapper<T extends AnySourceDrivenListenerFunction> = {
  options?: ListenerWrapperOptions<T>
  listener: T
}
export type EventListenerMap = Map<
  EventName,
  ListenerWrapper<EventDrivenListenerFunction>
>
export type RestListenerMap = Map<
  EventName,
  ListenerWrapper<RestDrivenListenerFunction>
>
export type BrokerListenerMap = Map<
  EventName,
  ListenerWrapper<BrokerDrivenListenerFunction>
>

export type ForeignContext = {
  user?: User
  clientId: string
}

export type EventControllerRegistrar = (
  io: Server,
  socket: Socket,
  foreignContext: ForeignContext,
) => (controllers: Controller[]) => Promise<void>

export type RestControllerRegistrar = (
  router: Router,
) => (controllers: Controller[], graph: GraphItem[]) => Promise<void>

export type BrokerControllerRegistrar = (
  subscription: BrokerSubscription,
) => (controllers: Controller[]) => Promise<void>

export type AddListenerFunction = <Props = any>(
  eventNameOrMeta: AddListenerFirstArgument,
  handler: ListenerFunction<Props>,
) => void

export type ControllerContext<
  T extends Record<string, unknown> = Record<string, unknown>,
> = {
  user: User | undefined
  event: string
  authRequired?: boolean
  transport: PokeTransports
  clientId: string
} & T

export type InvalidationFunction = () => void

export type ControllerRegisterer = (
  addListener: AddListenerFunction,
  helpers?: any,
) => InvalidationFunction | void

export type PokeTransports = 'ws' | 'rest' | 'broker'

export type Controller = {
  scope: string
  transport?: PokeTransports[]
  requireAuth?: boolean
  register: ControllerRegisterer
}

export type BrokerPublish = (channel: string, data: any) => void

export type BrokerSubscription = Subscription

export type BrokerMessage = Msg

export type BrokerRequestPayload = {
  eventName: EventName
  hash: string
  payload: any
}
