import { useStore } from '@/base/useStore'
import { PrimaryKeyFillStrategy } from '@/base/useTable/types'
import { primaryKey } from '@/services/wall/models/Wall.model'

export const filesStore = useStore<{ id: number; content: string }, 'id'>(
  'files',
  primaryKey,
  { pkStrategy: PrimaryKeyFillStrategy.AutoIncrement },
)

export default filesStore
