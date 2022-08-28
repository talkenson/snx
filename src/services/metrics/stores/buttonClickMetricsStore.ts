import { useStore } from '@/base/useStore'
import { PrimaryKeyFillStrategy, Table } from '@/base/useTable/types'
import { DUMP_METRICS_DELAY_SEC } from '@/services/metrics/config/config'
import { ButtonClick } from '@/services/metrics/types/landing.types'
import { openFile } from '@/services/metrics/utils/openFile'
import { addBeforeExitHook } from '@/utils/beforeExitHook'

const dumper = openFile<Table<ButtonClick, 'id'>>('buttonClickMetrics')

export const buttonClickMetricsStore = useStore<ButtonClick, 'id'>(
  'buttonClickMetrics',
  'id',
  {
    pkStrategy: PrimaryKeyFillStrategy.AutoIncrement,
  },
)

dumper.read().then(r => buttonClickMetricsStore._import(r))

addBeforeExitHook(async () => {
  await dumper.write(buttonClickMetricsStore.dump())
})

setInterval(() => {
  dumper.write(buttonClickMetricsStore.dump())
}, DUMP_METRICS_DELAY_SEC * 1000)

export default buttonClickMetricsStore
