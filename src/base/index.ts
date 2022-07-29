import { createServer } from 'http'
import expressApp from './expressApp'
import { patchServerWithIO } from './patchSocket'

const httpServer = createServer(expressApp)

const ioServer = patchServerWithIO(httpServer)

export { ioServer, httpServer }
