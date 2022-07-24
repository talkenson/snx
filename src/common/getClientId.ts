import { CONTEXT_FALLBACK_CLIENT_ID } from '@/config/secrets'

export const getClientId = (clientId?: string) =>
  clientId || CONTEXT_FALLBACK_CLIENT_ID
