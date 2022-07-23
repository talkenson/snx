import { Server } from 'socket.io'
import { Router } from 'express'
import { registerEventControllers } from '@/common/registerEventControllers'
import { registerRestControllers } from '@/common/registerRestControllers'
import { authenticationSocketMiddleware } from '@/utils/authentication/authenticationMiddleware'
import { Controller, BrokerSubscription } from '@/types'
import { User } from '@/models/User.model'
import { GraphItem } from '@/common/types/GraphItem.model'
import { registerBrokerControllers } from '@/common/registerBrokerControllers'

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
      ).then(user =>
        registerEventControllers(
          io,
          socket,
          user as User | undefined,
        )(controllers),
      )
    })
  }

  const registerAllRestControllers = (router: Router) => {
    registerRestControllers(router)(controllers, graph)

    console.log(graph)
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
