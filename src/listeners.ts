import { Router } from 'express'
import { ioServer } from '@/base'
import { createControllerRegistrar } from '@/common/createControllerRegistrators'
import { prisma } from '@/db'
import { registerAuthenticateController } from '@/services/authentication/authentication.controller'
import { registerCardsController } from '@/services/cards/cards.controller'
import { registerFilesController } from '@/services/files/files.controller'
import { registerLikesController } from '@/services/likes/likes.controller'
import { registerMetricsController } from '@/services/metrics/metrics.controller'
import { registerProfileController } from '@/services/profile/profile.controller'
import { registerSchemaController } from '@/services/schema/schema.controller'
import { registerSparkController } from '@/services/spark/spark.controller'
import { registerTelegramBotController } from '@/services/telegram-bot/telegram-bot.controller'
import { justLog } from '@/utils/justLog'
import mitt from 'mitt'

justLog.info('Creating registration handles...')

const router = Router()

export const { registerAllEventControllers, registerAllRestControllers } =
  await createControllerRegistrar(
    [
      registerAuthenticateController,
      registerCardsController,
      registerProfileController,
      registerSparkController,
      registerLikesController,
      registerFilesController,
      registerSchemaController,
      registerMetricsController,
      // registerTelegramBotController,
    ],
    {
      prisma: prisma,
      ws: { io: ioServer },
      rest: { router },
      internal: { bus: mitt() },
    },
  )([])
