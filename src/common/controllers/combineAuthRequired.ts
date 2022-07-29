import { exists } from '@/utils/exists'

export const combineAuthRequired = (
  outerAuth?: boolean,
  innerAuth?: boolean,
): boolean => (exists(innerAuth) ? innerAuth : outerAuth) || false
