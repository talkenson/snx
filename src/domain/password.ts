import { hash, compare } from 'bcrypt'
import { z } from 'zod'

export const RawPassword = z
  .string()
  .min(8)
  .max(64)
  .regex(/^[\wа-яё \-+=*%#$^@()[\]\\/]*$/i)

export type RawPassword = z.infer<typeof RawPassword>

export type HashedPassword = string

export const hashPassword = (password: RawPassword): Promise<HashedPassword> =>
  hash(password, 10)

export const verifyPassword =
  (hashedPassword: HashedPassword) =>
  (password: RawPassword): Promise<boolean> =>
    compare(hashedPassword, password)
