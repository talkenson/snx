import { useStore } from '@/base/useStore'
import { PrimaryKeyFillStrategy, Table } from '@/base/useTable/types'
import { DUMP_METRICS_DELAY_SEC } from '@/services/metrics/config/config'
import { LandingOpen } from '@/services/metrics/types/landing.types'
import { openFile } from '@/services/metrics/utils/openFile'
import { addBeforeExitHook } from '@/utils/beforeExitHook'

const dumper = openFile<Table<LandingOpen, 'id'>>('landingOpenMetrics')

export const landingMetricsStore = useStore<LandingOpen, 'id'>(
  'landingOpenMetrics',
  'id',
  {
    pkStrategy: PrimaryKeyFillStrategy.AutoIncrement,
  },
)

dumper.read().then(r => landingMetricsStore._import(r))

addBeforeExitHook(async () => {
  await dumper.write(landingMetricsStore.dump())
})

setInterval(() => {
  dumper.write(landingMetricsStore.dump())
}, DUMP_METRICS_DELAY_SEC * 1000)

export default landingMetricsStore
