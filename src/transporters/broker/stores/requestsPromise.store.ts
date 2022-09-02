import { useStore } from '@/base/useStore'
import { BrokerHash } from '@/transporters/broker/types'

export type BrokerRequestsStore = {
  hash: BrokerHash
  resolve: (value: unknown) => void
  reject: (reason?: string) => void
}

export const internalBrokerRequestsStore = useStore<
  BrokerRequestsStore,
  'hash'
>('internalBrokerRequestsStore', 'hash')

export default internalBrokerRequestsStore
