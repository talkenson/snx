import { customAlphabet } from 'nanoid'

const hashGen = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 6)

export const createRoomHash = (customSize?: number) => hashGen(customSize)
