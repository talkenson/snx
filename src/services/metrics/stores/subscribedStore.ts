import { useStore } from '@/base/useStore'
import { PrimaryKeyFillStrategy, Table } from '@/base/useTable/types'
import { DUMP_METRICS_DELAY_SEC } from '@/services/metrics/config/config'
import { LandingOpen } from '@/services/metrics/types/landing.types'
import { openFile } from '@/services/metrics/utils/openFile'
import { addBeforeExitHook } from '@/utils/beforeExitHook'

const dumper = openFile<Table<LandingOpen, 'id'>>('botSubscribedMetricsStore')

export const botSubscribedMetricsStore = useStore<LandingOpen, 'id'>(
  'botSubscribedMetricsStore',
  'id',
  {
    pkStrategy: PrimaryKeyFillStrategy.AutoIncrement,
  },
)

dumper.read().then(r => botSubscribedMetricsStore._import(r))

addBeforeExitHook(async () => {
  await dumper.write(botSubscribedMetricsStore.dump())
})

setInterval(() => {
  dumper.write(botSubscribedMetricsStore.dump())
}, DUMP_METRICS_DELAY_SEC * 1000)

export default botSubscribedMetricsStore
