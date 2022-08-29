import { DateTime } from 'luxon'
import botStartedMetricsStore from '@/services/metrics/stores/botStartedStore'
import botSubscribedMetricsStore from '@/services/metrics/stores/subscribedStore'
import {
  BotStartInput,
  BotSubscribeInput,
} from '@/services/metrics/types/bot.types'
import { exists } from '@/utils/exists'

export const telegramBotRepo = () => ({
  startMetrics(payload: BotStartInput) {
    botStartedMetricsStore.insert(payload.id, {
      ...payload,
      createdAt: DateTime.now().toUnixInteger(),
    })
  },
  isStarted(id: number) {
    return exists(botStartedMetricsStore.get(id))
  },
  subscribeMetrics(payload: BotSubscribeInput) {
    botSubscribedMetricsStore.insert(payload.id, {
      ...payload,
      createdAt: DateTime.now().toUnixInteger(),
    })
  },
  isSubscribed(id: number) {
    return exists(botSubscribedMetricsStore.get(id))
  },
})
