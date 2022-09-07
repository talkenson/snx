import { useStore } from '@/base/useStore'
import { PrimaryKeyFillStrategy } from '@/base/useTable/types'
import { InstanceInfo } from '@/types/instance.types'
import { DateTime } from 'luxon'

export const mainStore = useStore<{ id: string; startAt: DateTime }, 'id'>(
  'main-store',
  'id',
  {
    pkStrategy: PrimaryKeyFillStrategy.Hash,
  },
)

export default mainStore
