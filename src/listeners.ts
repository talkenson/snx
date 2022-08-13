import { Router } from 'express'
import { ioServer } from '@/base'
import { subscription } from '@/base/brokerService'
import { createControllerRegistrar } from '@/common/createControllerRegistrators'
import { registerAuthenticateController } from '@/services/authentication/authentication.controller'
import { registerWallController } from '@/services/wall/wall.controller'
import { justLog } from '@/utils/justLog'
import { prisma } from '@/db'
import { registerProfileController } from '@/services/profile/profile.controller'

justLog.info('Creating registration handles...')

const router = Router()

export const {
  registerAllEventControllers,
  registerAllRestControllers,
  registerAllBrokerControllers,
} = createControllerRegistrar(
  [
    registerAuthenticateController,
    registerWallController,
    registerProfileController,
  ],
  {
    prisma: prisma,
    ws: { io: ioServer },
    rest: { router },
    broker: { subscription },
  },
)
