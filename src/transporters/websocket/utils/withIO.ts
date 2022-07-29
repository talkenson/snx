import { Server } from 'socket.io'
import { ioServer } from '@/base/servers'

export const withIO = <T>(callableWantsIO: (io: Server) => T): T =>
  callableWantsIO(ioServer)
