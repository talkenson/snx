import { Response, Router } from 'express'
import { Msg, Subscription } from 'nats'
import { Server, Socket } from 'socket.io'
import { GraphItem } from '@/common/types/GraphItem.model'
import { User } from '@/models/User.model'

export type EventName = string

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

export type EventListenerMap = Map<EventName, EventDrivenListenerFunction>
export type RestListenerMap = Map<EventName, RestDrivenListenerFunction>
export type BrokerListenerMap = Map<EventName, BrokerDrivenListenerFunction>

export type EventControllerRegistrar = (
  io: Server,
  socket: Socket,
  user?: User,
) => (controllers: Controller[]) => Promise<void>

export type RestControllerRegistrar = (
  router: Router,
) => (controllers: Controller[], graph: GraphItem[]) => Promise<void>

export type BrokerControllerRegistrar = (
  subscription: BrokerSubscription,
) => (controllers: Controller[]) => Promise<void>

export type AddListenerFunction = <Props = any>(
  eventName: string,
  handler: ListenerFunction<Props>,
  specificTransport?: PokeTransports[],
) => void

export type ControllerContext<
  T extends Record<string, unknown> = Record<string, unknown>,
> = {
  user: User | undefined
  event: string
  authRequired?: boolean
  transport: PokeTransports
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
