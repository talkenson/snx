import { PrimaryKeyFillStrategy } from '@/base/types'
import {
  Credentials,
  credentialsPrimaryKey,
} from '@/common/types/Credentials.model'
import { useTable } from '@/store/store'

export const authenticationStore = useTable<
  Credentials,
  typeof credentialsPrimaryKey
>('authentication', credentialsPrimaryKey, {
  pkStrategy: PrimaryKeyFillStrategy.AutoIncrement,
})

export default authenticationStore
