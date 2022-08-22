import { Socket } from 'socket.io'
import { Account } from '@/domain/account'

export type SocketMap = {
  socketId: Socket['id']
  userId: Account['id']
}

export const primaryKey = 'userId'
