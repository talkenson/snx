import { z } from 'zod'
import { createController } from '@/common/createController'
import enEnums from '@/domain/enums/translations/en'
import ruEnums from '@/domain/enums/translations/ru'
import { Controller } from '@/types/controllerRelated.types'

export const registerSchemaController: Controller = createController({
  scope: 'schema',
  requireAuth: true,
  transport: ['ws', 'rest'],
  register: (addListener, repository) => {
    addListener<{ lang?: string }>(
      {
        eventName: 'getEnums',
        description: 'Get localizations for enums',
        requireAuth: false,
        restMethods: ['POST', 'GET'],
        validator: z.object({ lang: z.string().optional() }),
      },
      (resolve, reject, context) =>
        async ({ lang: passedLang }) => {
          const lang = passedLang || 'ru'

          return resolve({ enums: lang === 'ru' ? ruEnums : enEnums })
        },
    )
  },
})
