import { User } from '@/services/profile/models/User.model'
import socketMapStore from '@/transporters/websocket/stores/socketMap.store'
import { withIO } from '@/transporters/websocket/utils/withIO'

export const sendToUser = (
  userId: User['userId'],
  event: string,
  ...args: any[]
) =>
  withIO(io => {
    const socket = socketMapStore.find(v => v.userId === userId)?.socketId
    if (!socket) return
    io.to(socket).emit(event, ...args)
  })
