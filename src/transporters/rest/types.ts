import { Response, Router } from 'express'
import { SchemaItem } from '@/services/schema/models/SchemaItem.model'
import { Controller, ControllerContext } from '@/types/controllerRelated.types'
import {
  EventName,
  ListenerFunction,
  ListenerWrapper,
} from '@/types/listenerRelated.types'

export type RestMethod =
  | 'GET'
  | 'POST'
  | 'DELETE'
  | 'PATCH'
  | 'PUT'
  | 'OPTIONS'
  | 'HEAD'
  | 'ALL'

export type RestResponse = Response<any, Record<string, any>>

export type RestDrivenListenerFunction = (
  context: ControllerContext,
) => (
  res: RestResponse,
  ...payload: any[]
) => ReturnType<ReturnType<ListenerFunction>>

export type RestListenerMap = Map<
  EventName,
  ListenerWrapper<RestDrivenListenerFunction>
>

export type RestControllerRegistrar = (
  router: Router,
) => (controllers: Controller[], graph: SchemaItem[]) => Promise<void>
