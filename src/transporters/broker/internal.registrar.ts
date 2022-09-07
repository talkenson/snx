import { StringCodec } from 'nats'
import { combineAuthRequired } from '@/common/controllers/combineAuthRequired'
import { getAddListenerMetadata } from '@/common/controllers/getAddListenerMetadata'
import { handlerRestrictUnauthorized } from '@/common/controllers/handlerRestrictUnauthorized'
import {
  BrokerMessage,
  BrokerRequestPayload,
  InternalBrokerControllerRegistrar,
  InternalListenerMap,
} from '@/transporters/broker/types'
import { PokeTransport } from '@/types/PokeTransport'
import { Controller, ControllerContext } from '@/types/controllerRelated.types'
import {
  AddListenerFirstArgument,
  ListenerFunction,
} from '@/types/listenerRelated.types'
import { RegistrarInjection } from '@/types/registrar.types'
import { parseJSON } from '@/utils/parseJSON'
import { justLog } from '@/utils/justLog'
import { BROKER_INTERNAL_SUBJECT } from '@/config/broker'
import { buildRejectedResult, buildResolvedResult } from '@/common/builders'

const stringCodec = StringCodec()

export const internalRegistrar =
  ({
    prisma,
    makeRequest,
  }: RegistrarInjection): InternalBrokerControllerRegistrar =>
  ({ internalSubscription, publish }) =>
  async (controllers: Controller[]) => {
    const internalMap: InternalListenerMap = new Map()

    const createResolve = (message: BrokerMessage) => (result: any) =>
      message.respond(
        stringCodec.encode(JSON.stringify(buildResolvedResult(result))),
      )

    const createReject = (message: BrokerMessage) => (reason: unknown) =>
      message.respond(
        stringCodec.encode(JSON.stringify(buildRejectedResult(reason))),
      )

    const addListener =
      (
        scope: string,
        authRequired?: boolean,
        controllerTransport?: PokeTransport[],
      ) =>
      (
        eventNameOrMetadata: AddListenerFirstArgument,
        handler: ListenerFunction,
      ) => {
        const { eventName, ...metadata } =
          getAddListenerMetadata(eventNameOrMetadata)

        const authFlag = combineAuthRequired(authRequired, metadata.requireAuth)

        const fullEventRouteName = `${scope}/${eventName}`

        const setListener = () => {
          internalMap.set(fullEventRouteName, {
            listener:
              (context: ControllerContext) =>
              (message: BrokerMessage, ...params: any[]) => {
                if (!authFlag)
                  return handler(
                    createResolve(message),
                    createReject(message),
                    context,
                  )(...params)
                return handlerRestrictUnauthorized(createReject(message))
              },
          })
        }

        setListener()
      }

    await controllers.forEach(controller => {
      const repository = controller.repository
        ? controller.repository({ prisma })
        : undefined
      const setup = controller.setup ?? (() => Promise.resolve())
      setup(repository).then(() =>
        controller.register(
          addListener(
            controller.scope,
            controller.requireAuth,
            controller.transport,
          ),
          repository,
          makeRequest,
        ),
      )
    })

    await (async () => {
      for await (const message of internalSubscription) {
        const payload = parseJSON(stringCodec.decode(message.data)) as
          | BrokerRequestPayload
          | undefined
        if (!payload || !payload.event) {
          continue
        }

        // justLog.log(payload)

        const listenerWrapper = internalMap.get(payload.event)

        if (listenerWrapper) {
          listenerWrapper.listener({
            transport: 'broker',
            userId: -1,
            clientId: 'broker',
            event: payload.event,
          })(message, payload.payload)
        } else {
          continue
        }
      }
    })()
  }
