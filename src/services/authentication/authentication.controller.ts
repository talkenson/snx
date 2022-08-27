import bcrypt from 'bcrypt'
import {
  AuthCredentials,
  AuthStrategy,
  RegisterCredentials,
  RegisterStrategy,
  ZodAuthCredentials,
  ZodRegisterCredentials,
} from './models/Strategy.model'
import { createController } from '@/common/createController'
import { Account } from '@/domain/account'
import { authenticationRepo } from '@/services/authentication/authentication.repo'
import { AuthenticationError } from '@/services/authentication/etc/authentication.error'
import { authenticatePayload } from '@/utils/authentication/authenticatePayload'
import { extractJwtInfo } from '@/utils/authentication/extractJwtInfo'
import { issueNewToken } from '@/utils/authentication/issueNewToken'
import { exists } from '@/utils/exists'
import { justLog } from '@/utils/justLog'

export const registerAuthenticateController = createController({
  scope: 'authentication',
  transport: ['rest'],
  requireAuth: false,
  repository: authenticationRepo,
  register: (addListener, repository) => {
    addListener(
      {
        eventName: 'auth',
        description:
          'Authentication with email/pass pair, or session prolongation with old AccessToken and its RefreshToken',
        validator: ZodAuthCredentials,
      },
      (resolve, reject) => async (payload: AuthCredentials) => {
        if (payload.strategy === AuthStrategy.Local) {
          if (!exists(payload.email) || !exists(payload.password))
            return reject({ reason: AuthenticationError.BadCredentials })

          // const auth = authenticationStore.find(
          //   authInfo => authInfo.login === payload.email,
          // )

          const auth = await repository.findUser(payload.email)
          if (!exists(auth))
            return reject({ reason: AuthenticationError.UserNotFound })

          // No ClientID check in auth, because we anyway must give new AccessToken

          bcrypt.compare(
            payload.password,
            auth.password,
            async (err, result) => {
              if (result) {
                return resolve(
                  await issueNewToken(
                    auth as Account,
                    repository.refreshTokenUpdater,
                    payload.clientId,
                  ),
                )
              } else {
                return reject({ reason: AuthenticationError.BadCredentials })
              }
            },
          )
        } else if (payload.strategy === AuthStrategy.RefreshToken) {
          if (!exists(payload.refreshToken) || !exists(payload.refreshToken))
            return reject({ reason: AuthenticationError.MissingRefreshToken })
          if (!exists(payload.oldAccessToken))
            return reject({ reason: AuthenticationError.MissingOldAccessToken })

          const jwtBody = await extractJwtInfo(payload.oldAccessToken)

          const context = exists(jwtBody)
            ? authenticatePayload(jwtBody)
            : undefined

          if (!exists(context) || !exists(context.userId))
            return reject({ reason: AuthenticationError.InvalidOldAccessToken })

          const auth = await repository.getAccountByIdWithCommonClientToken(
            context.userId,
            context.clientId,
          )

          if (!exists(auth)) {
            return reject({ reason: AuthenticationError.InvalidAuthPayload })
          }

          if (auth.refreshChains.length > 1) {
            justLog.error(
              'For user',
              context.userId,
              'exists 2 or more refreshChains, its unacceptable (ClientID: ',
              context.clientId,
              ')',
              JSON.stringify(auth.refreshChains),
            )
          }

          const tokenQ = auth.refreshChains?.[0]?.token || undefined

          if (!exists(tokenQ) || tokenQ !== payload.refreshToken)
            return reject({ reason: AuthenticationError.InvalidRefreshToken })

          return resolve(
            await issueNewToken(
              auth as Account,
              repository.refreshTokenUpdater,
              context.clientId,
            ),
          )
        } else {
          return reject({
            reason: AuthenticationError.UnsupportedStrategy,
          })
        }
      },
    )

    addListener(
      {
        eventName: 'register',
        description: 'Registration with email/pass pair',
        validator: ZodRegisterCredentials,
      },
      (resolve, reject, context) => async (payload: RegisterCredentials) => {
        if (payload.strategy === RegisterStrategy.Local) {
          if (!exists(payload.email) || !exists(payload.password))
            return reject({ reason: AuthenticationError.BadCredentials })

          const isEmailExist = await repository.checkIfEmailExists(
            payload.email,
          )

          if (isEmailExist) {
            return reject({
              reason: AuthenticationError.AccountAlreadyExists,
            })
          }

          bcrypt.hash(payload.password, 10, async (err, hash) => {
            if (err) {
              return reject({
                reason: AuthenticationError.CantSolvePassword,
                err: JSON.stringify(err),
                message: 'Please, contact maintainer',
              })
            }

            const auth = await repository.createAccount({
              email: payload.email,
              password: hash,
            })

            return resolve(
              await issueNewToken(
                auth,
                repository.refreshTokenUpdater,
                payload.clientId,
              ),
            )
          })
        } else {
          return reject({
            reason: AuthenticationError.UnsupportedStrategy,
          })
        }
      },
    )
  },
})
