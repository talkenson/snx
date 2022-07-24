import { SocketMap, primaryKey } from '@/models/SocketMap.model'
import { useTable } from '@/store/store'

export const socketMapStore = useTable<SocketMap, typeof primaryKey>(
  'socketAuth',
  primaryKey,
)

export default socketMapStore
