import { useStore } from '@/base/useStore'
import { PrimaryKeyFillStrategy, Table } from '@/base/useTable/types'
import { DUMP_METRICS_DELAY_SEC } from '@/services/metrics/config/config'
import { LandingOpen } from '@/services/metrics/types/landing.types'
import { openFile } from '@/services/metrics/utils/openFile'
import { addBeforeExitHook } from '@/utils/beforeExitHook'

const dumper = openFile<Table<LandingOpen, 'id'>>('botStartedMetricsStore')

export const botStartedMetricsStore = useStore<LandingOpen, 'id'>(
  'botStartedMetricsStore',
  'id',
  {
    pkStrategy: PrimaryKeyFillStrategy.AutoIncrement,
  },
)

dumper.read().then(r => botStartedMetricsStore._import(r))

addBeforeExitHook(async () => {
  await dumper.write(botStartedMetricsStore.dump())
})

setInterval(() => {
  dumper.write(botStartedMetricsStore.dump())
}, DUMP_METRICS_DELAY_SEC * 1000)

export default botStartedMetricsStore
