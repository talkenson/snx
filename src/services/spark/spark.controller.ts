import { createController } from '@/common/createController'
import { SparkCreateInputPayload } from '@/domain/spark'
import { sparkRepo } from '@/services/spark/spark.repo'
import { Controller } from '@/types/controllerRelated.types'
import { exists } from '@/utils/exists'
import { createRateLimiter } from '@/utils/domain/simpleRateLimiter'
import cardsRateLimitStore from '@/services/cards/store/cardsRateLimitStore'
import { SparkType } from '@/domain/enums/spark-type'
import { DateTime } from 'luxon'

const rateLimiter = createRateLimiter(cardsRateLimitStore)

export const registerSparkController: Controller<ReturnType<typeof sparkRepo>> =
  createController({
    scope: 'spark',
    requireAuth: true,
    transport: ['ws', 'rest'],
    repository: sparkRepo,
    register: (addListener, repository) => {
      addListener<SparkCreateInputPayload>(
        {
          eventName: 'create',
          description: 'Create spark',
          requireAuth: true,
          restMethods: ['POST'],
          validator: SparkCreateInputPayload,
        },
        (resolve, reject, context) =>
          async ({ recipientId, sparkType }) => {
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

            const mutualSpark = await repository.checkIfMutualSparkExists({
              initiatorId: recipientId,
              recipientId: context.profileId,
            })

            const mutualSparkExists = exists(mutualSpark)

            const spark = await repository.createSpark({
              initiatorId: context.profileId,
              recipientId: recipientId,
              sparkType: sparkType,
              isSubmitted: mutualSparkExists || sparkType === SparkType.Dislike,
              submittedAt:
                mutualSparkExists || sparkType === SparkType.Dislike
                  ? DateTime.now().toJSDate()
                  : null,
            })

            rateLimiter.createRateLimit(context.userId!)

            if (mutualSparkExists) {
              repository.submitSpark(mutualSpark.id)
            }

            if (sparkType === SparkType.Like) {
              // No need to await
              repository.createSparkNotification(context.profileId, spark.id)
            }

            return resolve({ spark })
          },
      )
    },
  })
