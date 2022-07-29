import { Msg, Subscription } from 'nats'
import { Controller, ControllerContext } from '@/types/controllerRelated.types'
import {
  EventName,
  ListenerFunction,
  ListenerWrapper,
} from '@/types/listenerRelated.types'

export type BrokerDrivenListenerFunction = (
  context: ControllerContext,
) => (
  hash: string,
  ...payload: any[]
) => ReturnType<ReturnType<ListenerFunction>>

export type BrokerControllerRegistrar = (
  subscription: BrokerSubscription,
) => (controllers: Controller[]) => Promise<void>

export type BrokerPublish = (channel: string, data: any) => void

export type BrokerSubscription = Subscription

export type BrokerMessage = Msg

export type BrokerRequestPayload = {
  eventName: EventName
  hash: string
  payload: any
}

export type BrokerListenerMap = Map<
  EventName,
  ListenerWrapper<BrokerDrivenListenerFunction>
>
