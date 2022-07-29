import { SocketMap, primaryKey } from '../models/SocketMap.model'
import { useStore } from '@/base/useStore'

export const socketMapStore = useStore<SocketMap, typeof primaryKey>(
  'socketAuth',
  primaryKey,
)

export default socketMapStore
