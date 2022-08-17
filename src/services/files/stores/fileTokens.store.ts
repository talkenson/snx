import { useStore } from '@/base/useStore'
import { PrimaryKeyFillStrategy } from '@/base/useTable/types'

export const fileTokenStore = useStore<
  { token: string; count: number; filenames: string[]; used: boolean },
  'token'
>('fileToken', 'token', {
  pkStrategy: PrimaryKeyFillStrategy.Hash,
  hashIdSize: 32,
})

export default fileTokenStore
