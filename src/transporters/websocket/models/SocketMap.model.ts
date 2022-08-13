import { Socket } from 'socket.io'
import { User } from '@/services/profile/models/User.model'

export type SocketMap = {
  socketId: Socket['id']
  userId: User['userId']
}

export const primaryKey = 'userId'
