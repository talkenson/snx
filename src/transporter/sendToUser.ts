import { Crud } from '@/base/types'
import { SocketMap } from '@/models/SocketMap.model'
import { User } from '@/models/User.model'
import { withIO } from '@/transporter/withIO'

export const sendToUser =
  (authStore: Crud<SocketMap, 'socketId'>) =>
  (userId: User['userId'], event: string, ...args: any[]) =>
    withIO(io => {
      const socket = authStore.find(v => v.userId === userId)?.socketId
      if (!socket) return
      io.to(socket).emit(event, ...args)
    })
