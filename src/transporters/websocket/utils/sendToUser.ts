import socketMapStore from '@/transporters/websocket/stores/socketMap.store'
import { withIO } from '@/transporters/websocket/utils/withIO'
import { Account } from '@/domain/account'

export const sendToUser = (
  userId: Account['id'],
  event: string,
  ...args: any[]
) =>
  withIO(io => {
    const socket = socketMapStore.find(v => v.userId === userId)?.socketId
    if (!socket) return
    io.to(socket).emit(event, ...args)
  })
