import { createServer } from 'http'
import baseExpressApp from './baseExpressApp'
import { patchServerWithIO } from '@/socket'

const httpServer = createServer(baseExpressApp)

const ioServer = patchServerWithIO(httpServer)

export { ioServer, httpServer }
