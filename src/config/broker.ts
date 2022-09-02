export const POKE_API_BROKER_PREFIX = 'poke.api'
export const DEFAULT_BROKER_INTERNAL = 'poke.api.internal'

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

export const BROKER_INTERNAL_SUBJECT = (() => {
  return import.meta.env.VITE_BROKER_INTERNAL_SUBJECT || DEFAULT_BROKER_INTERNAL
})()
