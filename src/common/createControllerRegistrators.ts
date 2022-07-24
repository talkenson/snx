import { Router } from 'express'
import { Server } from 'socket.io'
import { registerBrokerControllers } from '@/common/registerBrokerControllers'
import { registerEventControllers } from '@/common/registerEventControllers'
import { registerRestControllers } from '@/common/registerRestControllers'
import { GraphItem } from '@/common/types/GraphItem.model'
import { User } from '@/models/User.model'
import { Controller, BrokerSubscription } from '@/types'
import { authenticationSocketMiddleware } from '@/utils/authentication/authenticationMiddleware'
import { createGraph } from '@/utils/graph/createGraph'

export const createControllerRegistrar = (
  controllers: Controller[],
): {
  registerAllEventControllers: (io: Server) => void
  registerAllRestControllers: (router: Router) => void
  registerAllBrokerControllers: (subscription: BrokerSubscription) => void
} => {
  const graph: GraphItem[] = []

  const registerAllEventControllers = (io: Server) => {
    // auto registration socket routes for each client
    io.on('connection', socket => {
      authenticationSocketMiddleware(
        socket.client.request.headers.authorization,
      ).then(context =>
        registerEventControllers(io, socket, context)(controllers),
      )
    })
  }

  const registerAllRestControllers = (router: Router) => {
    registerRestControllers(router)(controllers, graph)
    const schema = createGraph(graph)
    router.get('/', (req, res) => {
      res.json({ schema })
    })
  }

  const registerAllBrokerControllers = (subscription: BrokerSubscription) => {
    registerBrokerControllers(subscription)(controllers)
  }

  return {
    registerAllEventControllers,
    registerAllRestControllers,
    registerAllBrokerControllers,
  }
}
