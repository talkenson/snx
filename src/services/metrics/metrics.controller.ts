import { createController } from '@/common/createController'
import { metricsRepo } from '@/services/metrics/metrics.repo'
import {
  ButtonClickInput,
  LandingOpenInput,
} from '@/services/metrics/types/landing.types'
import { Controller } from '@/types/controllerRelated.types'

export const registerMetricsController: Controller<
  ReturnType<typeof metricsRepo>
> = createController({
  scope: 'metrics',
  requireAuth: false,
  transport: ['rest'],
  repository: metricsRepo,
  register: (addListener, repository) => {
    addListener<LandingOpenInput>(
      {
        eventName: 'landingOpenEvent',
        description: 'Increase counter for landing open',
        restMethods: ['POST'],
      },
      (resolve, reject, context) => payload => {
        repository.landingOpenEvent(payload)
        return resolve({})
      },
    )
    addListener<ButtonClickInput>(
      {
        eventName: 'buttonClickEvent',
        description: 'Increase counter for button clicks',
        restMethods: ['POST'],
      },
      (resolve, reject, context) => payload => {
        repository.buttonClickEvent(payload)
        return resolve({})
      },
    )
    addListener<ButtonClickInput>(
      {
        eventName: 'getClicks',
        description: 'Get bot button clicks',
        restMethods: ['POST', 'GET'],
      },
      (resolve, reject, context) => () => {
        return resolve({ clicks: repository.getButtonClicks() })
      },
    )
  },
})
