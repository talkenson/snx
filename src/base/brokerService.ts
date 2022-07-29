import { connect, StringCodec } from 'nats'
import {
  NATS_SERVER_ADDRESS,
  NATS_SERVER_PASS,
  NATS_SERVER_USER,
  NATS_USE_FLAG,
  POKE_API_BROKER_PREFIX,
} from '@/config/secrets'
import { BrokerPublish, BrokerSubscription } from '@/transporters/broker/types'
import { addBeforeExitHook } from '@/utils/beforeExitHook'
import { justLog } from '@/utils/justLog'

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

  justLog.info(`NATS: Connecting to NATS server...`)
  const nc = await connect({
    servers: NATS_SERVER_ADDRESS,
    user: NATS_SERVER_USER,
    pass: NATS_SERVER_PASS,
  })
  justLog.success(`NATS: Connected to ${nc.getServer()}`)

  const sc = StringCodec()

  const subscription = nc.subscribe(`${POKE_API_BROKER_PREFIX}.request`) // poke.api.request.CLIENT_ID

  addBeforeExitHook(async () => {
    justLog.info('Draining NATS queue...')
    await nc.drain() // like close, but will ensure that packages are received
  })

  const publish = (channel: string, data: any) =>
    nc.isClosed()
      ? justLog.error('ERROR: NATS Publishing when connection is closed!')
      : nc.publish(channel, sc.encode(JSON.stringify(data)))

  return {
    publish,
    subscription,
  }
}

const { publish, subscription } = await createNATSConnection()

export { publish, subscription }
