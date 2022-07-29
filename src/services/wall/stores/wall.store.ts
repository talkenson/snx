import { useStore } from '@/base/useStore'
import { PrimaryKeyFillStrategy } from '@/base/useTable/types'
import { WallPost, primaryKey } from '@/services/wall/models/Wall.model'
import { addBeforeExitHook } from '@/utils/beforeExitHook'
import { logEvent } from '@/utils/logEvent'

export const wallStore = useStore<WallPost, typeof primaryKey>(
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
