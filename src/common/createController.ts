import { Server } from 'socket.io'
import { Controller, ControllerRegisterer } from '@/types'

export const createController = (controller: {
  scope: Controller['scope']
  transport?: Controller['transport']
  requireAuth?: Controller['requireAuth']
  register: ControllerRegisterer
}): Controller => {
  return {
    scope: controller.scope,
    transport: controller.transport,
    requireAuth: controller.requireAuth,
    register: controller.register,
  }
}
