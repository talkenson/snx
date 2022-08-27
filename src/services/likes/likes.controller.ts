import { z } from 'zod'
import { createController } from '@/common/createController'
import { LikesError } from '@/services/likes/etc/likes.error'
import { likesRepo } from '@/services/likes/likes.repo'
import { Controller } from '@/types/controllerRelated.types'
import { exists } from '@/utils/exists'

export const registerLikesController: Controller<ReturnType<typeof likesRepo>> =
  createController({
    scope: 'likes',
    requireAuth: true,
    transport: ['ws', 'rest'],
    repository: likesRepo,
    register: (addListener, repository) => {
      addListener<{ take: number; page: number }>(
        {
          eventName: 'get',
          description: 'Get likes list',
          requireAuth: true,
          restMethods: ['POST'],
          validator: z.object({
            take: z.number().int(),
            page: z.number().int(),
          }),
        },
        (resolve, reject, context) =>
          async ({ page, take }) => {
            const profileId = await repository.getProfileId(context.userId!)
            if (!exists(profileId)) {
              return reject({ reason: LikesError.NeedToCreateProfile })
            }
            const likes = repository.getLikes({ profileId, take, page })
            return resolve({ likes })
          },
      )
    },
  })
