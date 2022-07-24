import { CrudStorage } from '@/base/types'
import { getBoundStorage } from '@/base/useTableWithStore'

const Storage: CrudStorage = {}

export const useTable = getBoundStorage(Storage)
