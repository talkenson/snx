import { Server, Socket } from 'socket.io'
import { combineAuthRequired } from '@/common/controllers/combineAuthRequired'
import { getAddListenerMetadata } from '@/common/controllers/getAddListenerMetadata'
import { handlerRestrictUnauthorized } from '@/common/controllers/handlerRestrictUnauthorized'
import { CommonError } from '@/common/enums/common.error'
import {
  EventControllerRegistrar,
  EventListenerMap,
} from '@/transporters/websocket/types'
import { emit } from '@/transporters/websocket/utils/emit'
import { PokeTransport } from '@/types/PokeTransport'
import { Controller, ControllerContext } from '@/types/controllerRelated.types'
import {
  AddListenerFirstArgument,
  ListenerFunction,
} from '@/types/listenerRelated.types'
import { RegistrarInjection } from '@/types/registrar.types'
import { exists } from '@/utils/exists'

export const websocketRegistrar =
  ({ prisma, makeRequest }: RegistrarInjection): EventControllerRegistrar =>
  (io: Server, socket: Socket, { userId, clientId }) =>
  async (controllers: Controller[]) => {
    const eventListenerMap: EventListenerMap = new Map()

    const createResolve =
      (fullEventName: string, hash: string) => (result: any) =>
        emit(`${fullEventName}.resolved`, socket, hash)(result)

    const createReject =
      (fullEventName: string, hash: string) => (result: any) =>
        emit(`${fullEventName}.rejected`, socket, hash)(result)

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

        const setEventListener = () => {
          eventListenerMap.set(fullEventRouteName, {
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

        const setFallbackEventListener = () => {
          eventListenerMap.set(fullEventRouteName, {
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
          metadata.transports?.includes('ws') ||
          controllerTransport?.includes('ws')
        ) {
          setEventListener()
        } else {
          setFallbackEventListener()
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
        makeRequest,
      )
    })

    /**
     * START Socket Registration Section
     */

    eventListenerMap.forEach(({ listener: listenerFn }, eventName) => {
      socket.on(eventName, (hash, ...args) =>
        listenerFn({
          transport: 'ws',
          userId: userId,
          clientId: clientId,
          event: eventName,
        })(hash, ...args),
      )
    })

    socket.onAny((...args) => console.log(socket.id, socket.rooms, args))

    socket.on('disconnect', () => {
      eventListenerMap.forEach(({ listener: listenerFn }, eventName) =>
        socket.off(eventName, listenerFn),
      )
    })

    /**
     * END Socket Registration Section
     */
  }
