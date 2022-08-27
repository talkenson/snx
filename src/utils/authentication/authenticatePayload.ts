import jwt from 'jsonwebtoken'
import { JWT_KEY_ISSUER } from '@/config/secrets'
import { ForeignContext } from '@/transporters/websocket/types'
import { getClientId } from '@/utils/authentication/getClientId'
import { exists } from '@/utils/exists'

export const authenticatePayload = (
  payload: jwt.JwtPayload,
): ForeignContext => {
  const { userId, clientId, iss } = payload
  if (!exists(userId) || !exists(iss) || iss !== JWT_KEY_ISSUER)
    return { clientId: getClientId(clientId) }
  return { userId, clientId: getClientId(clientId) }
}
