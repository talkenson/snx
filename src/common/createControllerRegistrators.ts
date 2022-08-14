import { PrismaClient } from '@prisma/client'
import { Router } from 'express'
import { SchemaItem } from '@/services/schema/models/SchemaItem.model'
import { brokerRegistrar } from '@/transporters/broker/broker.registrar'
import { restRegistrar } from '@/transporters/rest/rest.registrar'
import { websocketRegistrar } from '@/transporters/websocket/websocket.registrar'
import {
  Controller,
  ControllerRegistrarParameters,
} from '@/types/controllerRelated.types'
import { authenticationSocketMiddleware } from '@/utils/authentication/authenticationMiddleware'
import { createGraph } from '@/utils/graph/createGraph'

export const createControllerRegistrar = (
  controllers: Controller<any>[],
  {
    ws,
    rest,
    broker,
    prisma,
  }: ControllerRegistrarParameters & { prisma: PrismaClient },
): {
  registerAllEventControllers: () => void
  registerAllRestControllers: () => Router
  registerAllBrokerControllers: () => void
} => {
  const registerAllEventControllers = () => {
    // auto registration socket routes for each client
    ws.io.on('connection', socket => {
      authenticationSocketMiddleware(
        socket.client.request.headers.authorization,
      ).then(context =>
        websocketRegistrar({ prisma })(ws.io, socket, context)(controllers),
      )
    })
  }

  const registerAllRestControllers = () => {
    const schema: SchemaItem[] = []
    restRegistrar({ prisma })(rest.router)(controllers, schema)
    const builtSchema = createGraph(schema)
    rest.router.get('/', (req, res) => {
      res.json({ schema: builtSchema })
    })
    return rest.router
  }

  const registerAllBrokerControllers = () => {
    brokerRegistrar({ prisma })(broker.subscription)(controllers)
  }

  return {
    registerAllEventControllers,
    registerAllRestControllers,
    registerAllBrokerControllers,
  }
}
