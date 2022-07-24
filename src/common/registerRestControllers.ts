import { Router } from 'express'
import { getAddListenerMetadata } from '@/common/getAddListenerMetadata'
import { GraphItem } from '@/common/types/GraphItem.model'
import { handlerRestrictUnauthorized } from '@/common/universal/handlerRestrictUnauthorized'
import {
  Controller,
  ListenerFunction,
  RestResponse,
  PokeTransports,
  RestListenerMap,
  RestControllerRegistrar,
  ControllerContext,
  AddListenerFirstArgument,
} from '@/types'
import { exists } from '@/utils/exists'
import { logEvent } from '@/utils/logEvent'

export const registerRestControllers: RestControllerRegistrar =
  (router: Router) =>
  async (controllers: Controller[], graphBase: GraphItem[]) => {
    const restListenerMap: RestListenerMap = new Map()

    const createRestResolve = (res: RestResponse) => (result: any) =>
      res.json({ status: 'resolved', result: result })

    const createRestReject = (res: RestResponse) => (result: any) =>
      res.json({ status: 'rejected', result: result })

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

        // Pushing to graph

        graphBase.push({
          scope: scope,
          action: eventName,
          transports: metadata.transports || controllerTransport || ['ws'],
          schema: metadata.schema,
        })

        const fullEventRouteName = `${scope}/${eventName}`

        const setRestListener = () => {
          restListenerMap.set(
            fullEventRouteName,
            context =>
              (res, ...params: any[]) => {
                if (!authRequired || exists(context.user))
                  return handler(
                    createRestResolve(res),
                    createRestReject(res),
                    context,
                  )(...params)
                return handlerRestrictUnauthorized(createRestReject(res))
              },
          )
        }

        const setFallbackRestListener = () => {
          restListenerMap.set(
            fullEventRouteName,
            context => res =>
              res.json({
                status: 'Unreachable',
                solution: 'TRY_OTHER_TRANSPORT',
                handler: fullEventRouteName,
              }),
          )
        }

        /**
         * Defaults to only WS API if some specific options wasn't passed
         * Then listener is more important, then controller
         */

        if (metadata.transports) {
          if (metadata.transports.includes('rest')) {
            setRestListener()
          } else {
            setFallbackRestListener()
          }
        } else {
          if (controllerTransport?.includes('rest')) {
            setRestListener()
          } else {
            setFallbackRestListener()
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
     * START Rest Registration Section
     */

    restListenerMap.forEach((listenerFn, eventName) => {
      router.post(`/${eventName}`, (req, res) => {
        return listenerFn({
          transport: 'rest',
          user: res.locals.user,
          event: eventName,
        })(res, req.body)
      })
    })

    /**
     * END Rest Registration Section
     */
  }
