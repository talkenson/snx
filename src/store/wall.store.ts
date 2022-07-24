import { PrimaryKeyFillStrategy } from '@/base/types'
import { WallPost, primaryKey } from '@/models/Wall.model'
import { useTable } from '@/store/store'
import { addBeforeExitHook } from '@/utils/beforeExitHook'
import { logEvent } from '@/utils/logEvent'

export const wallStore = useTable<WallPost, typeof primaryKey>(
  'wall',
  primaryKey,
  { pkStrategy: PrimaryKeyFillStrategy.Hash },
)

/**
 * Trying to use beforeExitHook
 */

addBeforeExitHook(() =>
  logEvent('wallStore has', wallStore.length(), 'records. Will be transported'),
)

export default wallStore
