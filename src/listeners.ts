import { Router } from 'express'
import { ioServer } from '@/base'
import { subscription } from '@/base/brokerService'
import { createControllerRegistrar } from '@/common/createControllerRegistrators'
import { registerAuthenticateController } from '@/services/authentication/authentication.controller'
import { registerWallController } from '@/services/wall/wall.controller'
import { justLog } from '@/utils/justLog'

justLog.info('Creating registration handles...')

const router = Router()

export const {
  registerAllEventControllers,
  registerAllRestControllers,
  registerAllBrokerControllers,
} = createControllerRegistrar(
  [registerAuthenticateController, registerWallController],
  { ws: { io: ioServer }, rest: { router }, broker: { subscription } },
)
