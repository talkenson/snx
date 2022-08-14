import { useStore } from '@/base/useStore'
import { PrimaryKeyFillStrategy } from '@/base/useTable/types'

export const cardsRateLimitStore = useStore<{ userId: number }, 'userId'>(
  'cardsRateLimit',
  'userId',
  {
    pkStrategy: PrimaryKeyFillStrategy.AutoIncrement,
  },
)

export default cardsRateLimitStore
