import { useStore } from '@/base/useStore'
import { BrokerHash } from '@/transporters/broker/types'

export type InstanceMapStore = {
  instanceId: string
  services: string[]
}

export const instanceMapStore = useStore<InstanceMapStore, 'instanceId'>(
  'instanceMapStore',
  'instanceId',
)

export default instanceMapStore
