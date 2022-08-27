import { CommonError } from '@/common/enums/common.error'

export const handlerRestrictUnauthorized = (
  reject: (...reason: any[]) => any,
  context?: any,
) => reject({ reason: CommonError.Unauthorized, ...context })
