import { nanoid } from 'nanoid'
const DEFAULT_REFRESH_TOKEN_LENGTH = 64
const DEFAULT_JWT_LIFETIME_SEC = 3600
const DEFAULT_JWT_ISSUER = 'poke-default'
const DEFAULT_CLIENT_ID = 'default'
export const POKE_API_BROKER_PREFIX = 'poke.api'

export const JWT_KEY = (() => {
  const envJwtKey = import.meta.env.VITE_JWT_KEY
  if (!envJwtKey) {
    console.warn('Environment VITE_JWT_KEY key not found, using nanoid')
    return nanoid(20)
  } else {
    return envJwtKey
  }
})()

export const JWT_KEY_ISSUER = (() => {
  const jwtIssuer = import.meta.env.VITE_JWT_KEY_ISSUER
  if (!jwtIssuer) {
    console.warn(
      'Environment VITE_JWT_KEY_ISSUER key not found, using',
      DEFAULT_JWT_ISSUER,
    )
    return DEFAULT_JWT_ISSUER
  }
  return jwtIssuer
})()

export const REFRESH_TOKEN_LENGTH = (() => {
  const refreshTokenLength = import.meta.env.VITE_REFRESH_TOKEN_LENGTH
  const parsed = parseInt(refreshTokenLength)
  if (!refreshTokenLength || Number.isNaN(parsed)) {
    console.warn(
      'Environment VITE_REFRESH_TOKEN_LENGTH key not found or invalid, using',
      DEFAULT_REFRESH_TOKEN_LENGTH,
    )
    return DEFAULT_REFRESH_TOKEN_LENGTH
  } else {
    return parsed || DEFAULT_REFRESH_TOKEN_LENGTH
  }
})()

export const JWT_LIFETIME_SEC = (() => {
  const refreshTokenLength = import.meta.env.VITE_JWT_LIFETIME_SEC
  const parsed = parseInt(refreshTokenLength)
  if (!refreshTokenLength || Number.isNaN(parsed)) {
    console.warn(
      'Environment VITE_JWT_LIFETIME_SEC key not found or invalid, using',
      DEFAULT_JWT_LIFETIME_SEC,
    )
    return DEFAULT_JWT_LIFETIME_SEC
  } else {
    return parsed || DEFAULT_JWT_LIFETIME_SEC
  }
})()

export const CONTEXT_FALLBACK_CLIENT_ID = (() => {
  const fallbackClientId = import.meta.env.VITE_FALLBACK_CLIENT_ID
  if (!fallbackClientId) {
    return DEFAULT_CLIENT_ID
  }
  return fallbackClientId
})()

export const NATS_USE_FLAG = (() => {
  const useNats = import.meta.env.VITE_USE_NATS
  return useNats && useNats.length
})()

export const NATS_SERVER_ADDRESS = (() => {
  const natsAddr = import.meta.env.VITE_NATS_SERVER
  if (!natsAddr) {
    console.warn('Environment VITE_NATS_SERVER key not found or invalid')
    return undefined
  } else {
    return natsAddr
  }
})()

export const NATS_SERVER_USER = import.meta.env.VITE_NATS_SERVER_USER

export const NATS_SERVER_PASS = import.meta.env.VITE_NATS_SERVER_PASS

export const AWS_ACCESS_KEY = import.meta.env.VITE_AWS_ACCESS_KEY

export const AWS_SECRET_KEY = import.meta.env.VITE_AWS_SECRET_KEY

export const AWS_SERVER = import.meta.env.VITE_AWS_SERVER

export const AWS_BUCKET = import.meta.env.VITE_AWS_BUCKET

export const AWS_SSL_ENABLED = import.meta.env.VITE_AWS_SSL_ENABLED === 'true'
