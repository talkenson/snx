import { PrismaClient } from '@prisma/client'
import { Router } from 'express'
import { SchemaItem } from '@/services/schema/models/SchemaItem.model'
import { internalRegistrar } from '@/transporters/broker/internal.registrar'
import { restRegistrar } from '@/transporters/rest/rest.registrar'
import { websocketRegistrar } from '@/transporters/websocket/websocket.registrar'
import {
  Controller,
  ControllerRegistrarParameters,
} from '@/types/controllerRelated.types'
import { authenticationSocketMiddleware } from '@/utils/authentication/authenticationMiddleware'
import { createGraph } from '@/utils/graph/createGraph'
import { InstanceInfo } from '@/types/instance.types'
import mainStore from '@/common/stores/main.store'
import { GENERATED_INSTANCE_ID } from '@/config/server'
import { DateTime, Zone } from 'luxon'

export const createControllerRegistrar =
  (
    _controllers: Controller<any>[],
    {
      ws,
      rest,
      prisma,
      broker,
    }: ControllerRegistrarParameters & { prisma: PrismaClient },
  ) =>
  async (
    enabledControllers?: string[],
  ): Promise<{
    registerAllEventControllers: () => void
    registerAllRestControllers: () => Router
  }> => {
    const controllers =
      !enabledControllers || !enabledControllers.length
        ? _controllers
        : _controllers.filter(controller =>
            enabledControllers.includes(controller.scope),
          )

    const enabledControllersScopes = controllers.map(v => v.scope)

    const controllersStatus = _controllers.map(info => ({
      scope: info.scope,
      enabled: enabledControllersScopes.includes(info.scope),
    }))

    return await broker.initializer().then(brokerParams => {
      const autoRegisterInternalBrokerCommunications = () => {
        internalRegistrar({ prisma, makeRequest: brokerParams.makeRequest })(
          brokerParams,
        )(controllers)
      }
      autoRegisterInternalBrokerCommunications()

      const registerAllEventControllers = () => {
        // auto registration socket routes for each client
        ws.io.on('connection', socket => {
          authenticationSocketMiddleware(
            socket.client.request.headers.authorization,
          ).then(context =>
            websocketRegistrar({
              prisma,
              makeRequest: brokerParams.makeRequest,
            })(
              ws.io,
              socket,
              context,
            )(controllers),
          )
        })
      }

      const registerAllRestControllers = () => {
        const schema: SchemaItem[] = []
        restRegistrar({ prisma, makeRequest: brokerParams.makeRequest })(
          rest.router,
        )(controllers, schema)
        const builtSchema = createGraph(schema)
        rest.router.get('/', (req, res) => {
          res.json({ schema: builtSchema })
        })
        rest.router.get('/_info', (req, res) => {
          const instanceStatus = mainStore.get(GENERATED_INSTANCE_ID)!
          const uptime = DateTime.now().minus({
            seconds: instanceStatus.startAt.toSeconds(),
          })
          res.json({
            instance: {
              id: instanceStatus.id,
              uptime: uptime.toSeconds(),
              uptimeReadable: uptime.setZone('utc').toFormat('HH:mm:ss'),
              startAt: instanceStatus.startAt.toISO(),
            } as InstanceInfo,
            controllers: controllersStatus,
          })
        })
        return rest.router
      }

      return {
        registerAllEventControllers,
        registerAllRestControllers,
      }
    })
  }
