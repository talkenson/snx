import { connect, JSONCodec, RequestOptions, StringCodec } from 'nats'
import { z } from 'zod'
import { CommonError } from '@/common/enums/common.error'
import {
  BROKER_INTERNAL_SUBJECT,
  NATS_SERVER_ADDRESS,
  NATS_SERVER_PASS,
  NATS_SERVER_USER,
  NATS_USE_FLAG,
  POKE_API_BROKER_PREFIX,
} from '@/config/broker'
import {
  BrokerExported,
  BrokerMakeRequest,
  BrokerMessage,
  BrokerPublish,
  BrokerRequestPayload,
  BrokerSubscription,
} from '@/transporters/broker/types'
import { addBeforeExitHook } from '@/utils/beforeExitHook'
import { justLog } from '@/utils/justLog'

const zodInternalMessageFormat = z.object({
  event: z.string(),
  payload: z.any(),
})

enum Status {
  Resolved = 'resolved',
  Rejected = 'rejected',
}

const zodInternalReplyFormat = z.object({
  status: z.nativeEnum(Status),
  result: z.any(),
})

const createNATSConnection = (): Promise<BrokerExported> => {
  justLog.info(`NATS: Connecting to NATS server...`)
  return connect({
    servers: NATS_SERVER_ADDRESS,
    user: NATS_SERVER_USER,
    pass: NATS_SERVER_PASS,
  })
    .then(natsConnection => {
      justLog.success(`NATS: Connected to ${natsConnection.getServer()}`)
      const jsonCodec = JSONCodec()
      const stringCodec = StringCodec()

      let subscription: BrokerSubscription | undefined = undefined
      if (!NATS_USE_FLAG) {
        subscription = natsConnection.subscribe(
          `${POKE_API_BROKER_PREFIX}.request`,
        )
      }

      justLog.info('Internal subject named as', BROKER_INTERNAL_SUBJECT)

      const internalSubscription = natsConnection.subscribe(
        BROKER_INTERNAL_SUBJECT,
      )

      addBeforeExitHook(async () => {
        justLog.info('Draining NATS queue...')
        await natsConnection.drain() // like close, but will ensure that packages are received
      })

      const publish: BrokerPublish = (
        channel: string,
        data: Record<any, any>,
        options,
      ) => {
        if (natsConnection.isClosed())
          return justLog.error(
            'ERROR: NATS Publishing when connection is closed!',
          )

        natsConnection.publish(
          channel,
          stringCodec.encode(JSON.stringify(data)),
          options,
        )
      }

      const makeRequest = <ExpectedResult = unknown>(
        data: Record<any, any>,
        options?: Partial<RequestOptions>,
      ): Promise<{ status: Status.Resolved; result: ExpectedResult }> => {
        return new Promise((_res, _rej) => {
          const res = (result: ExpectedResult) =>
            _res({ status: Status.Resolved, result })

          const rej = (reason: unknown) =>
            _rej({ status: Status.Rejected, result: reason })

          if (natsConnection.isClosed())
            rej({ reason: 'ERROR: NATS Publishing when connection is closed!' })

          natsConnection
            .request(
              BROKER_INTERNAL_SUBJECT,
              stringCodec.encode(JSON.stringify(data)),
              {
                timeout: 10000,
                ...options,
              },
            )
            .then(result => {
              justLog.warn('request succeeded')

              const data = jsonCodec.decode(result.data)
              const validation = zodInternalReplyFormat.safeParse(data)
              if (validation && !validation.success) {
                return rej({
                  reason: CommonError.InvalidPayload,
                  description: validation.error.errors.map(
                    ({ path, code, message }) => ({
                      path,
                      code,
                      message,
                    }),
                  ),
                  message: validation.error.toString(),
                })
              }
              if (
                Object.prototype.hasOwnProperty.call(data, 'status') &&
                (data as { status: Status.Resolved; result: ExpectedResult })
                  .status === Status.Resolved
              ) {
                res(
                  (data as { status: Status.Resolved; result: ExpectedResult })
                    .result as ExpectedResult,
                )
              }
              rej((data as { status: Status.Rejected; result: unknown }).result)
            })
            .catch(error => {
              rej({ status: Status.Rejected, result: { ...error } })
            })
        })
      }

      publish(BROKER_INTERNAL_SUBJECT, {
        event: 'broker/connect',
        payload: {
          services: [],
        },
      } as BrokerRequestPayload)

      return {
        publish,
        makeRequest,
        subscription,
        internalSubscription,
      }
    })
    .catch(e => {
      justLog.error('Error connecting to NATS server')
      justLog.error(e.stack)

      return {
        publish: () => justLog.warn('NATS Server not connected'),
        makeRequest: (() =>
          justLog.warn(
            'NATS Server not connected',
          )) as unknown as BrokerMakeRequest,
        internalSubscription: undefined as unknown as BrokerSubscription,
      }
    })
}

export { createNATSConnection }
