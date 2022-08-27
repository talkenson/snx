import { z } from 'zod'
import { createController } from '@/common/createController'
import enEnums from '@/domain/enums/translations/en'
import ruEnums from '@/domain/enums/translations/ru'
import { Controller } from '@/types/controllerRelated.types'
import { groupedInterests } from '@/domain/groupedInterests'
import { justLog } from '@/utils/justLog'

const categoryPairs = Object.fromEntries(
  Object.entries(groupedInterests).flatMap(([group, interests]) =>
    interests.map(interest => [interest, group]),
  ),
)

const preparedRuDictionary = {
  ...ruEnums,
  Interests: Object.fromEntries(
    Object.entries(ruEnums.Interests).map(([key, value]) => [
      key,
      { value: value, category: categoryPairs[key] ?? 'unknown' },
    ]),
  ),
}

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
          const dictionary = lang === 'ru' ? preparedRuDictionary : enEnums

          return resolve({
            enums: dictionary,
          })
        },
    )

    addListener(
      {
        eventName: 'getInterests',
        description: 'Get grouped interests (GroupKey - InterestKey[])',
        requireAuth: false,
        restMethods: ['POST', 'GET'],
      },
      (resolve, reject, context) => () => {
        return resolve(groupedInterests)
      },
    )
  },
})
