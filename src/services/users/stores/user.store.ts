import { useStore } from '@/base/useStore'
import { PrimaryKeyFillStrategy } from '@/base/useTable/types'
import { User, userPrimaryKey } from '@/services/users/models/User.model'

export const userStore = useStore<User, typeof userPrimaryKey>(
  'users',
  userPrimaryKey,
  { pkStrategy: PrimaryKeyFillStrategy.AutoIncrement },
)

export default userStore
