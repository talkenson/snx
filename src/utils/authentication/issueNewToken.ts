import jwt from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import { getClientId } from '@/common/getClientId'
import { Credentials } from '@/common/types/Credentials.model'
import {
  JWT_KEY,
  JWT_KEY_ISSUER,
  JWT_LIFETIME_SEC,
  REFRESH_TOKEN_LENGTH,
} from '@/config/secrets'
import authenticationStore from '@/store/authentication.store'

export const issueNewToken = (
  auth: Credentials,
  clientId?: string,
  useOldRefreshToken?: boolean,
) => {
  const actualRefreshToken = useOldRefreshToken
    ? auth.refreshChain[getClientId(clientId)].token
    : nanoid(REFRESH_TOKEN_LENGTH)
  if (!useOldRefreshToken) {
    authenticationStore.reduceUpdate(auth.userId, data => ({
      ...data,
      refreshChain: {
        ...data.refreshChain,
        [getClientId(clientId)]: {
          token: actualRefreshToken,
        },
      },
    }))
  }
  return {
    userId: auth.userId,
    login: auth.login,
    token: jwt.sign(
      { userId: auth.userId, clientId: getClientId(clientId) },
      JWT_KEY,
      {
        expiresIn: JWT_LIFETIME_SEC,
        issuer: JWT_KEY_ISSUER,
      },
    ),
    refreshToken: actualRefreshToken,
  }
}
