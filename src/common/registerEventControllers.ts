import { Server, Socket } from 'socket.io'
import { getAddListenerMetadata } from '@/common/getAddListenerMetadata'
import { handlerRestrictUnauthorized } from '@/common/universal/handlerRestrictUnauthorized'
import { emit } from '@/transporter/emit'
import {
  Controller,
  ControllerContext,
  ListenerFunction,
  EventListenerMap,
  PokeTransports,
  EventControllerRegistrar,
  AddListenerFirstArgument,
} from '@/types'
import { exists } from '@/utils/exists'

export const registerEventControllers: EventControllerRegistrar =
  (io: Server, socket: Socket, { user, clientId }) =>
  async (controllers: Controller[]) => {
    const eventListenerMap: EventListenerMap = new Map()

    const createSocketResolve =
      (fullEventName: string, hash: string) => (result: any) =>
        emit(`${fullEventName}.resolved`, socket, hash)(result)

    const createSocketReject =
      (fullEventName: string, hash: string) => (result: any) =>
        emit(`${fullEventName}.rejected`, socket, hash)(result)

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

        const fullEventRouteName = `${scope}/${eventName}`

        const setEventListener = () => {
          eventListenerMap.set(
            fullEventRouteName,
            (context: ControllerContext) =>
              (hash: string, ...params: any[]) => {
                if (!authRequired || exists(context.user))
                  return handler(
                    createSocketResolve(fullEventRouteName, hash),
                    createSocketReject(fullEventRouteName, hash),
                    context,
                  )(...params)
                return handlerRestrictUnauthorized(
                  createSocketReject(fullEventRouteName, hash),
                )
              },
          )
        }

        const setFallbackEventListener = () => {
          eventListenerMap.set(fullEventRouteName, () => (hash: string) => {
            createSocketReject(
              fullEventRouteName,
              hash,
            )({
              status: 'Unreachable',
              solution: 'TRY_OTHER_TRANSPORT',
              handler: fullEventRouteName,
            })
          })
        }

        /**
         * Defaults to only WS API if some specific options wasn't passed
         * Then listener is more important, then controller
         */
        if (metadata.transports?.includes('ws')) {
          setEventListener()
        } else {
          if (!controllerTransport || !controllerTransport.length) {
            setEventListener()
          } else {
            if (controllerTransport.includes('ws')) {
              setEventListener()
            } else {
              setFallbackEventListener()
            }
          }
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

    /**
     * START Socket Registration Section
     */

    eventListenerMap.forEach((listenerFn, eventName) => {
      socket.on(
        eventName,
        listenerFn({
          transport: 'ws',
          user: user,
          clientId: clientId,
          event: eventName,
        }),
      )
    })

    socket.onAny((...args) => console.log(socket.id, socket.rooms, args))

    socket.on('disconnect', () => {
      eventListenerMap.forEach((listenerFn, eventName) =>
        socket.off(eventName, listenerFn),
      )
    })

    /**
     * END Socket Registration Section
     */
  }
