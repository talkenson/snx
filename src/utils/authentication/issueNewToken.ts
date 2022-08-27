import jwt from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import {
  JWT_KEY,
  JWT_KEY_ISSUER,
  JWT_LIFETIME_SEC,
  REFRESH_TOKEN_LENGTH,
} from '@/config/secrets'
import { Account } from '@/domain/account'
import { getClientId } from '@/utils/authentication/getClientId'
import { getToken } from '@/utils/authentication/repo'
import { exists } from '@/utils/exists'

export const issueNewToken = async (
  auth: Pick<Account, 'email' | 'id' | 'profile' | 'origin' | 'externalId'>,
  refreshTokenUpdater: (
    accountId: Account['id'],
    clientId: string,
    newToken: string,
  ) => Promise<unknown>,
  clientId?: string,
  useOldRefreshToken?: boolean,
) => {
  const safeClientId = getClientId(clientId)
  let actualRefreshToken = ''
  if (useOldRefreshToken) {
    const tokenData = await getToken(auth.id, safeClientId)
    if (exists(tokenData)) {
      actualRefreshToken = tokenData.token
    } else {
      actualRefreshToken = nanoid(REFRESH_TOKEN_LENGTH)
      await refreshTokenUpdater(auth.id, safeClientId, actualRefreshToken)
    }
  } else {
    actualRefreshToken = nanoid(REFRESH_TOKEN_LENGTH)
    await refreshTokenUpdater(auth.id, safeClientId, actualRefreshToken)
  }
  return {
    userId: auth.id,
    email: auth.email,
    origin: auth.origin,
    externalId: auth.externalId,
    expiresIn: JWT_LIFETIME_SEC,
    token: jwt.sign(
      {
        userId: auth.id,
        clientId: safeClientId,
      },
      JWT_KEY,
      {
        expiresIn: JWT_LIFETIME_SEC,
        issuer: JWT_KEY_ISSUER,
      },
    ),
    refreshToken: actualRefreshToken,
  }
}
