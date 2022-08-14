import jwt from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import {
  JWT_KEY,
  JWT_KEY_ISSUER,
  JWT_LIFETIME_SEC,
  REFRESH_TOKEN_LENGTH,
} from '@/config/secrets'
import { Account } from '@/domain/account'
import profileCacheStore from '@/services/profile/stores/profileCache.store'
import { getClientId } from '@/utils/authentication/getClientId'
import { getToken } from '@/utils/authentication/repo'
import { exists } from '@/utils/exists'

export const issueNewToken = async (
  auth: Pick<Account, 'email' | 'id' | 'profile'>,
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
    token: jwt.sign(
      {
        userId: auth.id,
        profileId:
          auth.profile?.id || profileCacheStore.get(auth.id)?.profileId || -1,
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
