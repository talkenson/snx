import { StringCodec } from 'nats'
import { publish } from '@/brokerService'
import { combineAuthRequired } from '@/common/combineAuthRequired'
import { getAddListenerMetadata } from '@/common/getAddListenerMetadata'
import { handlerRestrictUnauthorized } from '@/common/universal/handlerRestrictUnauthorized'
import { POKE_API_BROKER_PREFIX } from '@/config/secrets'
import { User } from '@/models/User.model'
import {
  Controller,
  ControllerContext,
  ListenerFunction,
  EventListenerMap,
  PokeTransports,
  BrokerControllerRegistrar,
  BrokerSubscription,
  BrokerListenerMap,
  BrokerRequestPayload,
  AddListenerFirstArgument,
} from '@/types'
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

export const registerBrokerControllers: BrokerControllerRegistrar =
  (subscription: BrokerSubscription) => async (controllers: Controller[]) => {
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
        controllerTransport?: PokeTransports[],
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
          brokerListenerMap.set(
            fullEventRouteName,
            (context: ControllerContext) =>
              (hash: string, ...params: any[]) => {
                if (!authFlag || exists(context.user))
                  return handler(
                    createResolve(fullEventRouteName, hash),
                    createReject(fullEventRouteName, hash),
                    context,
                  )(...params)
                return handlerRestrictUnauthorized(
                  createReject(fullEventRouteName, hash),
                )
              },
          )
        }

        const setFallbackListener = () => {
          brokerListenerMap.set(fullEventRouteName, () => (hash: string) => {
            createReject(
              fullEventRouteName,
              hash,
            )({
              status: 'Unreachable',
              solution: 'TRY_OTHER_TRANSPORT',
              handler: fullEventRouteName,
            })
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
      )
    })

    for await (const message of subscription) {
      const payload = parseJSON(brokerStringCodec.decode(message.data)) as
        | BrokerRequestPayload
        | undefined
      if (!payload || !payload.hash || !payload.eventName) {
        continue
      }

      const listenerFn = brokerListenerMap.get(payload.eventName)

      if (listenerFn) {
        listenerFn({
          transport: 'broker',
          user: {} as User,
          clientId: 'broker',
          event: payload.eventName,
        })(payload.hash, payload.payload)
      } else {
        continue
      }
    }
  }
