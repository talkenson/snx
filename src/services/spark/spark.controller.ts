import { DateTime } from 'luxon'
import { createController } from '@/common/createController'
import { SparkType } from '@/domain/enums/spark-type'
import { SparkCreateInputPayload } from '@/domain/spark'
import cardsRateLimitStore from '@/services/cards/stores/cardsRateLimitStore'
import { SparkError } from '@/services/spark/etc/spark.error'
import { sparkRepo } from '@/services/spark/spark.repo'
import { Controller } from '@/types/controllerRelated.types'
import { createRateLimiter } from '@/utils/domain/simpleRateLimiter'
import { exists } from '@/utils/exists'

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
                reason: SparkError.RateLimit,
                description: 'Requests are too often',
              })
            }
            const profileId = await repository.getProfileId(context.userId!)
            if (!exists(profileId)) {
              return reject({ reason: SparkError.NeedToCreateProfile })
            }

            const mutualSpark = await repository.checkIfMutualSparkExists({
              initiatorId: recipientId,
              recipientId: profileId,
            })

            const mutualSparkExists = exists(mutualSpark)

            const spark = await repository.createSpark({
              initiatorId: profileId,
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
              repository.createSparkNotification(
                profileId,
                spark.id,
                recipientId,
              )
            }

            return resolve({ spark })
          },
      )
    },
  })
