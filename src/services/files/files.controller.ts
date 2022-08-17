import { nanoid } from 'nanoid'
import { z } from 'zod'
import { createController } from '@/common/createController'
import { filesRepo } from '@/services/files/files.repo'
import fileTokensStore from '@/services/files/stores/fileTokens.store'
import { Controller } from '@/types/controllerRelated.types'

export const registerFilesController: Controller<ReturnType<typeof filesRepo>> =
  createController({
    scope: 'files',
    requireAuth: true,
    transport: ['ws', 'rest'],
    repository: filesRepo,
    register: (addListener, repository) => {
      addListener<{ count?: number }>(
        {
          eventName: 'getUploadToken',
          description: 'Get token for uploading file',
          requireAuth: true,
          restMethods: ['POST'],
          validator: z.object({
            count: z.number().int().min(1).max(1).optional(),
          }),
        },
        (resolve, reject, context) =>
          ({ count: rawCount }) => {
            const count = rawCount || 1
            const token = fileTokensStore.create({
              count: count,
              filenames: [`${nanoid(32)}.jpg`],
              used: false,
            })
            return resolve(token)
          },
      )
    },
  })
