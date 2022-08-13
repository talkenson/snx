import { useStore } from '@/base/useStore'
import { PrimaryKeyFillStrategy } from '@/base/useTable/types'

export const profileCacheStore = useStore<
  { accountId: number; profileId: number },
  'accountId'
>('profileCache', 'accountId', {
  pkStrategy: PrimaryKeyFillStrategy.AutoIncrement,
})

export default profileCacheStore
