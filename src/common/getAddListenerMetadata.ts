import { AddListenerFirstArgument, ListenerMetadata } from '@/types'

export const getAddListenerMetadata = (
  nameOrMetadata: AddListenerFirstArgument,
): ListenerMetadata => {
  if (typeof nameOrMetadata === 'string')
    return {
      eventName: nameOrMetadata,
    }
  return nameOrMetadata
}
