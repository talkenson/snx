export enum AuthenticationError {
  BadCredentials = 'BAD_CREDENTIALS',
  MissingRefreshToken = 'MISSING_REFRESH_TOKEN',
  MissingOldAccessToken = 'MISSING_OLD_ACCESS_TOKEN',
  InvalidOldAccessToken = 'INVALID_OLD_ACCESS_TOKEN',
  InvalidAuthPayload = 'INVALID_AUTH_PAYLOAD',
  InvalidRefreshToken = 'INVALID_REFRESH_TOKEN',
  UnsupportedStrategy = 'UNSUPPORTED_STRATEGY',
  AccountAlreadyExists = 'ACCOUNT_ALREADY_EXISTS',
  CantSolvePassword = 'CANT_SOLVE_PASSWORD',
  VKCodeNotPresented = 'VK_CODE_NOT_PRESENTED',
  VKAuthFailed = 'VK_AUTH_FAILED',
}
