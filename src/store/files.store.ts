import { PrimaryKeyFillStrategy } from '@/base/types'
import { primaryKey } from '@/models/Wall.model'
import { useTable } from '@/store/store'

export const filesStore = useTable<{ id: number; content: string }, 'id'>(
  'files',
  primaryKey,
  { pkStrategy: PrimaryKeyFillStrategy.AutoIncrement },
)

export default filesStore
