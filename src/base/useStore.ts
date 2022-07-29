import { CrudStorage } from '@/base/useTable/types'
import { getBoundStorage } from '@/base/useTable/useTableWithStore'

const Storage: CrudStorage = {}

export const useStore = getBoundStorage(Storage)
