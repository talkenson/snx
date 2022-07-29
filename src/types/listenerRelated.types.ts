import { z } from 'zod'
import { BrokerDrivenListenerFunction } from '@/transporters/broker/types'
import {
  RestDrivenListenerFunction,
  RestMethod,
} from '@/transporters/rest/types'
import { EventDrivenListenerFunction } from '@/transporters/websocket/types'
import { PokeTransport } from '@/types/PokeTransport'
import { ControllerContext } from '@/types/controllerRelated.types'

export type EventName = string

export type ListenerMetadata = {
  eventName: EventName
  transports?: PokeTransport[]
  schema?: unknown
  description?: string
  requireAuth?: boolean
  restMethods?: RestMethod[]
  validator?: z.ZodSchema
}

export type AddListenerFirstArgument = EventName | ListenerMetadata

export type ListenerFunction<Props = any> = (
  resolve: (...result: unknown[]) => void,
  reject: (...reason: unknown[]) => void,
  context: ControllerContext,
) => (...payload: Props[]) => void

type AnySourceDrivenListenerFunction =
  | EventDrivenListenerFunction
  | RestDrivenListenerFunction
  | BrokerDrivenListenerFunction

export type ListenerWrapperOptions<T extends AnySourceDrivenListenerFunction> =
  T extends RestDrivenListenerFunction
    ? {
        restMethods: RestMethod[]
      }
    : unknown

export type ListenerWrapper<T extends AnySourceDrivenListenerFunction> = {
  options?: ListenerWrapperOptions<T>
  listener: T
}

export type AddListenerFunction = <Props = any>(
  eventNameOrMeta: AddListenerFirstArgument,
  handler: ListenerFunction<Props>,
) => void
