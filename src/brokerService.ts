import { connect, StringCodec } from 'nats'
import {
  NATS_SERVER_ADDRESS,
  NATS_SERVER_PASS,
  NATS_SERVER_USER,
  NATS_USE_FLAG,
  POKE_API_BROKER_PREFIX,
} from '@/config/secrets'
import { addBeforeExitHook } from '@/utils/beforeExitHook'
import { logEvent } from '@/utils/logEvent'
import {
  BrokerPublish,
  BrokerRequestPayload,
  BrokerSubscription,
} from '@/types'
import { nanoid } from 'nanoid'

const createNATSConnection = async (): Promise<{
  publish: BrokerPublish
  subscription: BrokerSubscription
}> => {
  if (!NATS_USE_FLAG) {
    return {
      subscription: [] as unknown as BrokerSubscription,
      publish: () => {
        throw Error('You are not using NATS, regarding to your configuration.')
      },
    }
  }

  logEvent(`NATS: Connecting to NATS server...`)
  const nc = await connect({
    servers: NATS_SERVER_ADDRESS,
    user: NATS_SERVER_USER,
    pass: NATS_SERVER_PASS,
  })
  logEvent(`NATS: Connected to ${nc.getServer()}`)

  const sc = StringCodec()

  const subscription = nc.subscribe(`${POKE_API_BROKER_PREFIX}.request`) // poke.api.request.CLIENT_ID

  // Only logging purpose
  const responseListenSub = nc.subscribe(`${POKE_API_BROKER_PREFIX}.response`) // poke.api.request.CLIENT_ID

  ;(async () => {
    for await (const m of responseListenSub) {
      console.log(
        `RESPONSE [${responseListenSub.getProcessed()}]: ${sc.decode(m.data)}`,
      )
    }
  })()

  addBeforeExitHook(async () => {
    logEvent('Draining NATS queue...')
    await nc.drain() // like close, but will ensure that packages are received
  })

  const publish = (channel: string, data: any) =>
    nc.isClosed()
      ? logEvent('ERROR: NATS Publishing when connection is closed!')
      : nc.publish(channel, sc.encode(JSON.stringify(data)))

  return {
    publish,
    subscription,
  }
}

const { publish, subscription } = await createNATSConnection()

publish('poke.api.request', {
  eventName: 'authentication/register',
  hash: nanoid(10),
  payload: { strategy: 'local', login: 'muss', password: 'test' },
} as BrokerRequestPayload)

publish('poke.api.request', {
  eventName: 'authentication/auth',
  hash: nanoid(10),
  payload: { strategy: 'local', login: 'muss', password: 'test' },
} as BrokerRequestPayload)

export { publish, subscription }
