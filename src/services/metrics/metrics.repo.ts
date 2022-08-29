import { DateTime } from 'luxon'
import botStartedMetricsStore from '@/services/metrics/stores/botStartedStore'
import buttonClickMetricsStore from '@/services/metrics/stores/buttonClickMetricsStore'
import landingMetricsStore from '@/services/metrics/stores/landingMetricsStore'
import botSubscribedMetricsStore from '@/services/metrics/stores/subscribedStore'
import {
  ButtonClickInput,
  LandingOpenInput,
} from '@/services/metrics/types/landing.types'

export const metricsRepo = () => ({
  landingOpenEvent(payload: LandingOpenInput) {
    landingMetricsStore.create({
      ...payload,
      createdAt: DateTime.now().toUnixInteger(),
    })
  },
  buttonClickEvent(payload: ButtonClickInput) {
    buttonClickMetricsStore.create({
      ...payload,
      createdAt: DateTime.now().toUnixInteger(),
    })
  },
  getButtonClicks() {
    return buttonClickMetricsStore.length()
  },
  getBotStarts() {
    return botStartedMetricsStore.dump()
  },
  getBotSubscribes() {
    return botSubscribedMetricsStore.dump()
  },
})
