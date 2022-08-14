import { Crud } from '@/base/useTable/types'
import { exists } from '@/utils/exists'

export const createRateLimiter = (
  store: Crud<{ userId: number }, 'userId'>,
  timeout = 5,
) => ({
  createRateLimit(userId: number) {
    store.insert(userId, { userId })
    setTimeout(() => {
      store.delete(userId)
    }, timeout * 1000)
  },
  isRateLimited(userId: number) {
    return exists(store.get(userId))
  },
})
