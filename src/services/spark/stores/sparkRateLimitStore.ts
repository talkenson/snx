import { useStore } from '@/base/useStore'
import { PrimaryKeyFillStrategy } from '@/base/useTable/types'

export const sparkRateLimitStore = useStore<{ userId: number }, 'userId'>(
  'cardsRateLimit',
  'userId',
  {
    pkStrategy: PrimaryKeyFillStrategy.AutoIncrement,
  },
)

export default sparkRateLimitStore
