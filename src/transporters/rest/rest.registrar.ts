import { Router } from 'express'
import { z } from 'zod'
import { combineAuthRequired } from '@/common/controllers/combineAuthRequired'
import { getAddListenerMetadata } from '@/common/controllers/getAddListenerMetadata'
import { handlerRestrictUnauthorized } from '@/common/controllers/handlerRestrictUnauthorized'
import { CommonError } from '@/common/enums/common.error'
import { SchemaItem } from '@/services/schema/models/SchemaItem.model'
import {
  RestControllerRegistrar,
  RestListenerMap,
  RestMethod,
  RestResponse,
} from '@/transporters/rest/types'
import { PokeTransport } from '@/types/PokeTransport'
import { Controller, ControllerContext } from '@/types/controllerRelated.types'
import {
  AddListenerFirstArgument,
  ListenerFunction,
} from '@/types/listenerRelated.types'
import { RegistrarInjection } from '@/types/registrar.types'
import { exists } from '@/utils/exists'

export const restRegistrar =
  ({ prisma }: RegistrarInjection): RestControllerRegistrar =>
  (router: Router) =>
  async (controllers: Controller[], graphBase: SchemaItem[]) => {
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
            listener: context => (res, payload: any) => {
              if (metadata.validator) {
                const validation = metadata.validator.safeParse(payload)
                if (validation && !validation.success) {
                  return createRestReject(res)({
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
              if (!authFlag || exists(context.userId)) {
                return handler(
                  createRestResolve(res),
                  createRestReject(res),
                  context,
                )(payload)
              }
              return handlerRestrictUnauthorized(createRestReject(res), context)
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
                status: 'unreachable',
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
        controller.repository ? controller.repository({ prisma }) : undefined,
      )
    })

    /**
     * START Rest Registration Section
     */

    restListenerMap.forEach(({ options, listener: listenerFn }, eventName) => {
      router.all(`/${eventName}`, (req, res) => {
        if (options?.restMethods.includes(<RestMethod>req.method)) {
          return listenerFn({
            transport: 'rest',
            userId: res.locals.userId,
            clientId: res.locals.clientId,
            event: eventName,
          })(res, { ...req.query, ...req.body })
        } else {
          return res.status(405).json({
            reason: CommonError.NotAllowed,
            supported: options?.restMethods,
          })
        }
      })
    })

    /**
     * END Rest Registration Section
     */
  }
