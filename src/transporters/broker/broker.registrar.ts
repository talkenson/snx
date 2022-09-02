import { StringCodec } from 'nats'
import { combineAuthRequired } from '@/common/controllers/combineAuthRequired'
import { getAddListenerMetadata } from '@/common/controllers/getAddListenerMetadata'
import { handlerRestrictUnauthorized } from '@/common/controllers/handlerRestrictUnauthorized'
import { CommonError } from '@/common/enums/common.error'
import { POKE_API_BROKER_PREFIX } from '@/config/broker'
import {
  BrokerControllerRegistrar,
  BrokerListenerMap,
  BrokerRequestPayload,
  BrokerSubscription,
} from '@/transporters/broker/types'
import { PokeTransport } from '@/types/PokeTransport'
import { Controller, ControllerContext } from '@/types/controllerRelated.types'
import {
  AddListenerFirstArgument,
  ListenerFunction,
} from '@/types/listenerRelated.types'
import { RegistrarInjection } from '@/types/registrar.types'
import { exists } from '@/utils/exists'
import { parseJSON } from '@/utils/parseJSON'

const brokerStringCodec = StringCodec()

const createBrokerResponse = (
  eventName: string,
  hash: string,
  status: string,
  payload: any,
) => {
  return { status, eventName, hash, payload }
}

export const brokerRegistrar =
  ({ prisma }: RegistrarInjection): BrokerControllerRegistrar =>
  ({ subscription, publish }) =>
  async (controllers: Controller[]) => {
    const brokerListenerMap: BrokerListenerMap = new Map()

    const createResolve =
      (fullEventName: string, hash: string) => (result: any) =>
        publish(
          `${POKE_API_BROKER_PREFIX}.response`,
          createBrokerResponse(fullEventName, hash, 'resolved', result),
        )

    const createReject =
      (fullEventName: string, hash: string) => (result: any) =>
        publish(
          `${POKE_API_BROKER_PREFIX}.response`,
          createBrokerResponse(fullEventName, hash, 'rejected', result),
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
          brokerListenerMap.set(fullEventRouteName, {
            listener:
              (context: ControllerContext) =>
              (hash: string, ...params: any[]) => {
                if (metadata.validator) {
                  const validation = metadata.validator.safeParse(params)
                  if (validation && !validation.success) {
                    return createReject(
                      fullEventRouteName,
                      hash,
                    )({
                      reason: CommonError.InvalidPayload,
                      description: validation.error.errors.map(
                        ({ path, code, message }) => ({
                          path,
                          code,
                          message,
                        }),
                      ),
                    })
                  }
                }
                if (!authFlag || exists(context.userId))
                  return handler(
                    createResolve(fullEventRouteName, hash),
                    createReject(fullEventRouteName, hash),
                    context,
                  )(...params)
                return handlerRestrictUnauthorized(
                  createReject(fullEventRouteName, hash),
                )
              },
          })
        }

        const setFallbackListener = () => {
          brokerListenerMap.set(fullEventRouteName, {
            listener: () => (hash: string) => {
              createReject(
                fullEventRouteName,
                hash,
              )({
                status: 'unreachable',
                solution: 'TRY_OTHER_TRANSPORT',
                handler: fullEventRouteName,
              })
            },
          })
        }

        if (
          metadata.transports?.includes('broker') ||
          controllerTransport?.includes('broker')
        ) {
          setListener()
        } else {
          setFallbackListener()
        }
      }

    await controllers.forEach(controller => {
      controller.register(
        addListener(
          controller.scope,
          controller.requireAuth,
          controller.transport,
        ),
        controller.repository ? controller.repository({ prisma }) : undefined,
      )
    })

    for await (const message of subscription!) {
      const payload = parseJSON(brokerStringCodec.decode(message.data)) as
        | BrokerRequestPayload
        | undefined
      if (!payload || !payload.hash || !payload.event) {
        continue
      }

      const listenerWrapper = brokerListenerMap.get(payload.event)

      if (listenerWrapper) {
        listenerWrapper.listener({
          transport: 'broker',
          userId: -1,
          profileId: -1,
          clientId: 'broker',
          event: payload.event,
        })(payload.hash, payload.payload)
      } else {
        continue
      }
    }
  }
