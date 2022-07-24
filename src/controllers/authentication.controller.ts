import bcrypt from 'bcrypt'
import { nanoid } from 'nanoid'
import { createController } from '@/common/createController'
import { getClientId } from '@/common/getClientId'
import {
  AuthCredentials,
  AuthStrategy,
  RegisterCredentials,
  RegisterStrategy,
} from '@/common/types/Strategy.model'
import { REFRESH_TOKEN_LENGTH } from '@/config/secrets'
import { authenticationStore } from '@/store/authentication.store'
import { userStore } from '@/store/user.store'
import { Controller } from '@/types'
import { authenticatePayload } from '@/utils/authentication/authenticatePayload'
import { extractJwtInfo } from '@/utils/authentication/extractJwtInfo'
import { issueNewToken } from '@/utils/authentication/issueNewToken'
import { exists } from '@/utils/exists'
import { createRandomUserName } from '@/utils/helpers/createRandomUserName'

export const registerAuthenticateController: Controller = createController({
  scope: 'authentication',
  transport: ['rest'],
  requireAuth: false,
  register: addListener => {
    addListener(
      {
        eventName: 'auth',
        description:
          'Authentication with login/pass pair, or session prolongation with old AccessToken and its RefreshToken',
      },
      (resolve, reject) => (payload: AuthCredentials) => {
        if (payload.strategy === AuthStrategy.Local) {
          if (!exists(payload.login) || !exists(payload.password))
            return reject({ reason: 'BAD_CREDENTIALS' })

          const auth = authenticationStore.find(
            authInfo => authInfo.login === payload.login,
          )
          if (!exists(auth)) return reject({ reason: 'USER_NOT_FOUND' })

          // No ClientID check in auth, because we anyway must give new AccessToken

          bcrypt.compare(payload.password, auth.password, (err, result) => {
            if (result) {
              return resolve(issueNewToken(auth, payload.clientId))
            } else {
              return reject({ reason: 'BAD_CREDENTIALS' })
            }
          })
        } else if (payload.strategy === AuthStrategy.RefreshToken) {
          if (!exists(payload.refreshToken) || !exists(payload.refreshToken))
            return reject({ reason: 'EMPTY_REFRESH_TOKEN' })
          if (!exists(payload.oldAccessToken))
            return reject({ reason: 'EMPTY_OLD_ACCESS_TOKEN' })

          const jwtBody = extractJwtInfo(payload.oldAccessToken)

          const context =
            jwtBody && typeof jwtBody !== 'string'
              ? authenticatePayload(jwtBody)
              : undefined

          if (!exists(context) || !exists(context?.user))
            return reject({ reason: 'INVALID_OLD_ACCESS_TOKEN' })

          const auth = authenticationStore.get(context.user.userId)

          if (
            !exists(auth) ||
            !auth.refreshChain[getClientId(context.clientId)] ||
            auth.refreshChain[getClientId(context.clientId)].token !==
              payload.refreshToken
          )
            return reject({ reason: 'INVALID_REFRESH_TOKEN' })

          return resolve(issueNewToken(auth, context.clientId))
        } else {
          return reject({
            reason: 'UNSUPPORTED_STRATEGY',
          })
        }
      },
    )

    addListener(
      {
        eventName: 'register',
        transports: ['ws', 'rest', 'broker'],
        description: 'Registration with login/pass pair',
      },
      (resolve, reject, context) => (payload: RegisterCredentials) => {
        if (payload.strategy === RegisterStrategy.Local) {
          if (!exists(payload.login) || !exists(payload.password))
            return reject({ reason: 'BAD_CREDENTIALS' })
          const auth = authenticationStore.find(
            authInfo => authInfo.login === payload.login,
          )
          if (exists(auth)) return reject({ reason: 'USER_ALREADY_EXISTS' })

          bcrypt.hash(payload.password, 10, (err, hash) => {
            if (err) {
              return reject({
                reason: 'CANT_SOLVE_PASSWORD',
                err: JSON.stringify(err),
                message: 'Please, contact maintainer',
              })
            }
            const auth = authenticationStore.create({
              login: payload.login,
              password: hash,
              refreshChain: {
                [getClientId(payload.clientId)]: {
                  token: nanoid(REFRESH_TOKEN_LENGTH),
                },
              },
            })
            const user = userStore.insert(auth.userId, {
              name: createRandomUserName(),
              userId: auth.userId,
            })

            return resolve(issueNewToken(auth, payload.clientId))
          })
        } else {
          return reject({
            reason: 'UNSUPPORTED_STRATEGY',
          })
        }
      },
    )
  },
})
