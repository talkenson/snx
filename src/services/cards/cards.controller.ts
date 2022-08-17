import { createController } from '@/common/createController'
import { GetCardsPayload } from '@/domain/card'
import { cardsRepo } from '@/services/cards/cards.repo'
import cardsRateLimitStore from '@/services/cards/store/cardsRateLimitStore'
import { Controller } from '@/types/controllerRelated.types'
import { createRateLimiter } from '@/utils/domain/simpleRateLimiter'
import { exists } from '@/utils/exists'

const rateLimiter = createRateLimiter(cardsRateLimitStore)

export const registerCardsController: Controller<ReturnType<typeof cardsRepo>> =
  createController({
    scope: 'cards',
    requireAuth: true,
    transport: ['ws', 'rest'],
    repository: cardsRepo,
    register: (addListener, repository) => {
      addListener<GetCardsPayload>(
        {
          eventName: 'get',
          description: 'Get wanted amount of cards (5-20~10)',
          requireAuth: true,
          restMethods: ['POST', 'GET'],
          validator: GetCardsPayload,
        },
        (resolve, reject, context) =>
          async ({ count: passedCount }) => {
            if (rateLimiter.isRateLimited(context.userId!)) {
              return reject({
                reason: 'RATE_LIMIT',
                description: 'Requests are too often',
              })
            }
            const profileId = await repository.getProfileId(context.userId!)
            if (!exists(profileId)) {
              return reject({ reason: 'YOU_HAVE_NO_PROFILE_NEED_TO_CREATE' })
            }
            if (context.profileId === -1 || !exists(context.profileId)) {
              context.profileId = profileId
            }
            const count = passedCount || 10
            const profiles = await repository.getProfiles(
              context.profileId,
              count,
            )
            rateLimiter.createRateLimit(context.userId!)

            return resolve({ profiles, count: profiles.length })
          },
      )
    },
  })
