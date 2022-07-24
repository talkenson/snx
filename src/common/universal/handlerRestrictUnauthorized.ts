export const handlerRestrictUnauthorized = (
  reject: (...reason: any[]) => any,
  context?: any,
) => reject({ reason: 'UNAUTHORIZED', ...context })
