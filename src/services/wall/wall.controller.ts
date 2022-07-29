import { createController } from '@/common/createController'
import { WallPost } from '@/services/wall/models/Wall.model'
import { wallStore } from '@/services/wall/stores'
import { Controller } from '@/types/controllerRelated.types'
import { z } from 'zod'

export const registerWallController: Controller = createController({
  scope: 'wall',
  requireAuth: false,
  transport: ['rest', 'ws'],
  register: addListener => {
    addListener<WallPost>(
      {
        eventName: 'createPost',
        transports: ['rest'],
      },
      (resolve, reject, context) => item => {
        const result = wallStore.create(item)
        return resolve(result)
      },
    )

    addListener(
      {
        eventName: 'get',
      },
      (resolve, reject, context) =>
        ({ target }: { target: number }) => {
          return resolve({ content: wallStore.get(target), context })
        },
    )

    addListener('list', (resolve, reject, context) => () => {
      return resolve(wallStore.dumpToArray())
    })
  },
})
