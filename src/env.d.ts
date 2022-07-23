/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HOST: string
  readonly VITE_PORT: string
  readonly VITE_SCHEMA: string
  readonly VITE_JWT_KEY: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_REFRESH_TOKEN_LENGTH: string
  readonly VITE_JWT_LIFETIME_SEC: string
  readonly VITE_USE_NATS: string
  readonly VITE_NATS_SERVER: string
  readonly VITE_NATS_SERVER_USER: string
  readonly VITE_NATS_SERVER_PASS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
