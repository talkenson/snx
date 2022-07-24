import { createController } from '@/common/createController'
import { exposeCrud } from '@/common/exposeCrud'
import { userStore } from '@/store/user.store'
import { Controller } from '@/types'

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
