import type { Server as HTTPServer } from 'http'
import { Server } from 'socket.io'

const patchServerWithIO = (httpServer: HTTPServer) => {
  return new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['polling', 'websocket'],
  })
}

export { patchServerWithIO }
