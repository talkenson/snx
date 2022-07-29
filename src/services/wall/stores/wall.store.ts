import { useStore } from '@/base/useStore'
import { PrimaryKeyFillStrategy } from '@/base/useTable/types'
import { WallPost, primaryKey } from '@/services/wall/models/Wall.model'
import { addBeforeExitHook } from '@/utils/beforeExitHook'
import { justLog } from '@/utils/justLog'

export const wallStore = useStore<WallPost, typeof primaryKey>(
  'wall',
  primaryKey,
  { pkStrategy: PrimaryKeyFillStrategy.Hash },
)

/**
 * Trying to use beforeExitHook
 */

addBeforeExitHook(() =>
  justLog.info('wallStore has', wallStore.length(), 'records'),
)
