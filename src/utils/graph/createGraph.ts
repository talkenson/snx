import { SchemaItem } from '@/services/schema/models/SchemaItem.model'

const necessaryKeys: (keyof SchemaItem)[] = ['scope', 'action', 'authRequired']

export const createGraph = (graph: SchemaItem[]) => {
  return (
    graph.map(v =>
      Object.fromEntries(
        Object.entries(v).filter(
          ([key, value]) =>
            !!value || necessaryKeys.includes(key as keyof SchemaItem),
        ),
      ),
    ) as SchemaItem[]
  ).reduce((a, v) => {
    return {
      ...a,
      [v.scope]: {
        ...(a[v.scope] ?? {}),
        [v.action]: {
          methods: v.restMethods,
          authRequired: v.authRequired,
          transports: v.transports,
          description: v.description,
          schema: v.schema,
        },
      },
    }
  }, {} as Record<string, Record<string, any>>)
}
