import { DateTime } from 'luxon'
import buttonClickMetricsStore from '@/services/metrics/stores/buttonClickMetricsStore'
import landingMetricsStore from '@/services/metrics/stores/landingMetricsStore'
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
})
