import { GraphItem } from '@/common/types/GraphItem.model'

const necessaryKeys: (keyof GraphItem)[] = ['scope', 'action', 'authRequired']

export const createGraph = (graph: GraphItem[]) => {
  return (
    graph.map(v =>
      Object.fromEntries(
        Object.entries(v).filter(
          ([key, value]) =>
            !!value || necessaryKeys.includes(key as keyof GraphItem),
        ),
      ),
    ) as GraphItem[]
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
