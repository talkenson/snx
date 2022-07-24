import jwt from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import { Credentials } from '@/common/types/Credentials.model'
import {
  JWT_KEY,
  JWT_LIFETIME_SEC,
  REFRESH_TOKEN_LENGTH,
} from '@/config/secrets'
import authenticationStore from '@/store/authentication.store'

export const issueNewToken = (
  auth: Credentials,
  useOldRefreshToken?: boolean,
) => {
  const actualRefreshToken = useOldRefreshToken
    ? auth.refreshToken
    : nanoid(REFRESH_TOKEN_LENGTH)
  if (!useOldRefreshToken) {
    authenticationStore.reduceUpdate(auth.userId, data => ({
      ...data,
      refreshToken: actualRefreshToken,
    }))
  }
  return {
    userId: auth.userId,
    login: auth.login,
    token: jwt.sign({ userId: auth.userId }, JWT_KEY, {
      expiresIn: JWT_LIFETIME_SEC,
    }),
    refreshToken: actualRefreshToken,
  }
}
