import { createControllerRegistrar } from '@/common/createControllerRegistrators'
import { registerAuthenticateController } from '@/controllers/authentication.controller'
import { registerWallController } from '@/controllers/wall.controller'
import { logEvent } from '@/utils/logEvent'

logEvent('Creating registration handles...')

export const {
  registerAllEventControllers,
  registerAllRestControllers,
  registerAllBrokerControllers,
} = createControllerRegistrar([
  registerAuthenticateController,
  registerWallController,
])
