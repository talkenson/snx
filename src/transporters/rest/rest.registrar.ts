import { Router } from 'express'
import { combineAuthRequired } from '@/common/controllers/combineAuthRequired'
import { getAddListenerMetadata } from '@/common/controllers/getAddListenerMetadata'
import { handlerRestrictUnauthorized } from '@/common/controllers/handlerRestrictUnauthorized'
import { GraphItem } from '@/services/schema/models/GraphItem.model'
import {
  RestControllerRegistrar,
  RestListenerMap,
  RestResponse,
} from '@/transporters/rest/types'
import { RestMethod } from '@/types'
import { PokeTransport } from '@/types/PokeTransport'
import { Controller, ControllerContext } from '@/types/controllerRelated.types'
import {
  AddListenerFirstArgument,
  ListenerFunction,
} from '@/types/listenerRelated.types'
import { exists } from '@/utils/exists'
import { logEvent } from '@/utils/logEvent'

export const restRegistrar: RestControllerRegistrar =
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
        controllerTransport?: PokeTransport[],
      ) =>
      (
        eventNameOrMetadata: AddListenerFirstArgument,
        handler: ListenerFunction,
      ) => {
        const { eventName, ...metadata } =
          getAddListenerMetadata(eventNameOrMetadata)

        const authFlag = combineAuthRequired(authRequired, metadata.requireAuth)

        // Pushing to graph

        graphBase.push({
          scope: scope,
          action: eventName,
          transports: metadata.transports || controllerTransport || ['ws'],
          schema: metadata.schema,
          authRequired: authFlag,
          description: metadata.description,
          restMethods: metadata.restMethods || ['POST'],
        })

        const fullEventRouteName = `${scope}/${eventName}`

        const setRestListener = () => {
          restListenerMap.set(fullEventRouteName, {
            options: {
              restMethods: metadata.restMethods || ['POST'],
            },
            listener:
              context =>
              (res, ...params: any[]) => {
                if (!authFlag || exists(context.user))
                  return handler(
                    createRestResolve(res),
                    createRestReject(res),
                    context,
                  )(...params)
                return handlerRestrictUnauthorized(
                  createRestReject(res),
                  context,
                )
              },
          })
        }

        const setFallbackRestListener = () => {
          restListenerMap.set(fullEventRouteName, {
            options: {
              restMethods: metadata.restMethods || ['POST'],
            },
            listener: context => res =>
              res.json({
                status: 'Unreachable',
                solution: 'TRY_OTHER_TRANSPORT',
                handler: fullEventRouteName,
              }),
          })
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

    restListenerMap.forEach(({ options, listener: listenerFn }, eventName) => {
      router.all(`/${eventName}`, (req, res) => {
        if (options?.restMethods.includes(<RestMethod>req.method))
          return listenerFn({
            transport: 'rest',
            user: res.locals.user,
            clientId: res.locals.clientId,
            event: eventName,
          })(res, req.body)
        return res
          .status(404)
          .send({ reason: 'NOT_FOUND', supported: options?.restMethods })
      })
    })

    /**
     * END Rest Registration Section
     */
  }
