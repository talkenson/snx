import { exposeCrud } from '@/common/controllers/exposeCrud'
import { createController } from '@/common/createController'
import { userStore } from '@/services/users/stores'
import { Controller } from '@/types/controllerRelated.types'

export const registerUsersController: Controller = createController({
  scope: 'users',
  requireAuth: true,
  transport: ['ws', 'rest'],
  register: addListener => {
    exposeCrud(userStore, ['get', 'patch', 'update', 'dump', 'dumpToArray'])(
      addListener,
    )
  },
})
