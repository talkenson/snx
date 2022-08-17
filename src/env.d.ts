/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HOST: string
  readonly VITE_PORT: string
  readonly VITE_SCHEMA: string
  readonly VITE_JWT_KEY: string
  readonly VITE_JWT_KEY_ISSUER: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_REFRESH_TOKEN_LENGTH: string
  readonly VITE_FALLBACK_CLIENT_ID: string
  readonly VITE_JWT_LIFETIME_SEC: string
  readonly VITE_USE_NATS: string
  readonly VITE_NATS_SERVER: string
  readonly VITE_NATS_SERVER_USER: string
  readonly VITE_NATS_SERVER_PASS: string
  readonly VITE_AWS_ACCESS_KEY: string
  readonly VITE_AWS_SECRET_KEY: string
  readonly VITE_AWS_SERVER: string
  readonly VITE_AWS_BUCKET: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
