import { useStore } from '@/base/useStore'
import { PrimaryKeyFillStrategy } from '@/base/useTable/types'

export const filesStore = useStore<{ id: number; content: string }, 'id'>(
  'files',
  'id',
  { pkStrategy: PrimaryKeyFillStrategy.AutoIncrement },
)

export default filesStore
