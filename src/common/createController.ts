import {
  Controller,
  ControllerRegisterer,
  DefaultRepositoryType,
} from '@/types/controllerRelated.types'

export const createController = <
  Repository extends DefaultRepositoryType | undefined,
>(controller: {
  scope: Controller['scope']
  transport?: Controller['transport']
  requireAuth?: Controller['requireAuth']
  repository?: Controller<Repository>['repository']
  register: ControllerRegisterer<Repository>
}): Controller<Repository> => {
  return {
    scope: controller.scope,
    transport: controller.transport,
    requireAuth: controller.requireAuth,
    repository: controller.repository,
    register: controller.register,
  }
}
