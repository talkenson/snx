import { createController } from '@/common/createController'
import { WallPost } from '@/models/Wall.model'
import { wallStore } from '@/store/wall.store'
import { Controller } from '@/types'

export const registerWallController: Controller = createController({
  scope: 'wall',
  requireAuth: true,
  transport: ['rest', 'ws'],
  register: addListener => {
    addListener<WallPost>(
      {
        eventName: 'createPost',
        transports: ['rest'],
      },
      (resolve, reject, context) => item => {
        const result = wallStore.create(item)
        resolve(result)
      },
    )

    addListener(
      'get',
      (resolve, reject, context) =>
        ({ target }: { target: number }) => {
          resolve({ content: wallStore.get(target), context })
        },
    )

    addListener('list', (resolve, reject, context) => () => {
      resolve(wallStore.dumpToArray())
    })
  },
})
