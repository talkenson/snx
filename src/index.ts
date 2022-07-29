'use strict'
import { httpServer } from '@/base'
import {
  registerAllRestControllers,
  registerAllEventControllers,
  registerAllBrokerControllers,
} from '@/listeners'
import { app } from '@/rest'
import { authenticationExpressMiddleware } from '@/utils/authentication/authenticationMiddleware'
import { callbackCollection } from '@/utils/beforeExitHook'
import { justLog } from '@/utils/justLog'
const PORT = parseInt(import.meta.env.VITE_PORT || '3071')
const HOST = import.meta.env.VITE_HOST || '0.0.0.0'
const SCHEMA = import.meta.env.VITE_SCHEMA || 'http'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

justLog.info('Registering REST endpoints...')
const apiRouter = registerAllRestControllers()
app.use(API_BASE_URL, authenticationExpressMiddleware)
app.use(API_BASE_URL, apiRouter)
justLog.info('Registering WS wrapper listener...')
registerAllEventControllers()
justLog.info('Registering NATS listener...')
registerAllBrokerControllers()

const listener = httpServer.listen(PORT, HOST, () => {
  justLog.success(
    `Setup succeed! Listening on ${SCHEMA}://${HOST}:${PORT}${API_BASE_URL}`,
  )
})

process.on('SIGINT', async () => {
  justLog.warn('Forced stopping. Calling exit hooks...')
  await listener.close()
  await Promise.all(callbackCollection.map(f => f()))
  process.exit()
})
