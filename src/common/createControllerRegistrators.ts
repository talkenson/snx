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

export const createControllerRegistrar = async (
  controllers: Controller<any>[],
  {
    ws,
    rest,
    prisma,
    broker,
  }: ControllerRegistrarParameters & { prisma: PrismaClient },
): Promise<{
  registerAllEventControllers: () => void
  registerAllRestControllers: () => Router
}> => {
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
          websocketRegistrar({ prisma, makeRequest: brokerParams.makeRequest })(
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
      return rest.router
    }

    return {
      registerAllEventControllers,
      registerAllRestControllers,
    }
  })
}
