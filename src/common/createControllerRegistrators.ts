import { PrismaClient } from '@prisma/client'
import { Router } from 'express'
import { SchemaItem } from '@/services/schema/models/SchemaItem.model'
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
import { DateTime } from 'luxon'

export const createControllerRegistrar =
  (
    _controllers: Controller<any>[],
    {
      ws,
      rest,
      prisma,
      internal,
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

    const registerAllEventControllers = () => {
      // auto registration socket routes for each client
      ws.io.on('connection', socket => {
        authenticationSocketMiddleware(
          socket.client.request.headers.authorization,
        ).then(context =>
          websocketRegistrar({
            prisma,
            bus: internal.bus,
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
      restRegistrar({ prisma, bus: internal.bus })(rest.router)(
        controllers,
        schema,
      )
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
  }
