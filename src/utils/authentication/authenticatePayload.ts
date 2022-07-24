import jwt from 'jsonwebtoken'
import { User } from '@/models/User.model'
import userStore from '@/store/user.store'
import { exists } from '@/utils/exists'

export const authenticatePayload = (
  payload: jwt.JwtPayload,
): User | undefined => {
  const { userId } = payload
  if (!exists(userId)) return undefined
  const predictableUser = userStore.get(userId)
  if (exists(predictableUser)) {
    return predictableUser
  }
  return undefined
}
