import { Msg, PublishOptions, RequestOptions, Subscription } from 'nats'
import { Controller, ControllerContext } from '@/types/controllerRelated.types'
import {
  EventName,
  ListenerFunction,
  ListenerWrapper,
} from '@/types/listenerRelated.types'

export type BrokerHash = string

export type BrokerDrivenListenerFunction = (
  context: ControllerContext,
) => (
  hash: BrokerHash,
  ...payload: any[]
) => ReturnType<ReturnType<ListenerFunction>>

export type BrokerControllerRegistrar = (
  brokerMeta: BrokerExported,
) => (controllers: Controller[]) => Promise<void>

export type InternalBrokerControllerRegistrar = (
  brokerMeta: BrokerExported,
) => (controllers: Controller[]) => Promise<void>

export type BrokerPublish = (
  channel: string,
  data: Record<any, any>,
  options?: PublishOptions,
) => void

export type BrokerSubscription = Subscription

export type BrokerMessage = Msg

export type BrokerMakeRequest = <ExpectedResult = unknown>(
  channel: string,
  data: Record<any, any>,
  options?: Partial<RequestOptions>,
) => Promise<{
  status: 'resolved'
  result: ExpectedResult
}>

export type BrokerExported = {
  publish: BrokerPublish
  makeRequest: BrokerMakeRequest
  subscription?: BrokerSubscription
  internalSubscription: BrokerSubscription
}

export type BrokerRequestPayload = {
  event: EventName
  payload: any
  hash?: BrokerHash
}

export type BrokerListenerMap = Map<
  EventName,
  ListenerWrapper<BrokerDrivenListenerFunction>
>

export type InternalDrivenListenerFunction = (
  context: ControllerContext,
) => (...payload: any[]) => ReturnType<ReturnType<ListenerFunction>>

export type InternalListenerMap = Map<
  EventName,
  ListenerWrapper<InternalDrivenListenerFunction>
>
