import { useStore } from '@/base/useStore'
import { PrimaryKeyFillStrategy } from '@/base/useTable/types'
import {
  Credentials,
  credentialsPrimaryKey,
} from '@/services/authentication/models/Credentials.model'

export const authenticationStore = useStore<
  Credentials,
  typeof credentialsPrimaryKey
>('authentication', credentialsPrimaryKey, {
  pkStrategy: PrimaryKeyFillStrategy.AutoIncrement,
})

export default authenticationStore
