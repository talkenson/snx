import { z } from 'zod'
import { RawPassword } from '@/domain/password'

export enum AuthStrategy {
  Local = 'local',
  External = 'external',
  RefreshToken = 'refreshToken',
  VK = 'vk',
  Telegram = 'telegram',
}

export enum RegisterStrategy {
  Local = 'local',
  External = 'external',
  VK = 'vk',
}

export const ZodAuthCredentials = z.discriminatedUnion('strategy', [
  z.object({ strategy: z.literal(AuthStrategy.Local) }).merge(
    z.object({
      email: z.string().email(),
      password: RawPassword,
      clientId: z.string().optional(),
    }),
  ),
  z.object({ strategy: z.literal(AuthStrategy.RefreshToken) }).merge(
    z.object({
      refreshToken: z.string(),
      oldAccessToken: z.string(),
    }),
  ),
  z.object({ strategy: z.literal(AuthStrategy.VK) }).merge(
    z.object({
      code: z.string(),
      clientId: z.string().optional(),
    }),
  ),
  z.object({ strategy: z.literal(AuthStrategy.Telegram) }).merge(
    z.object({
      data: z.object({
        id: z.number(),
        first_name: z.string(),
        username: z.string().optional(),
        photo_url: z.string().optional(),
        auth_date: z.number(),
        hash: z.string(),
      }),
      clientId: z.string().optional(),
    }),
  ),
  z.object({ strategy: z.literal(AuthStrategy.External) }).merge(
    z.object({
      userId: z.number(),
      signature: z.string(),
    }),
  ),
])

export type AuthCredentials = z.infer<typeof ZodAuthCredentials>

export const ZodRegisterCredentials = z.discriminatedUnion('strategy', [
  z.object({ strategy: z.literal(RegisterStrategy.Local) }).merge(
    z.object({
      email: z.string().email(),
      password: RawPassword,
      clientId: z.string().optional(),
    }),
  ),
  z.object({ strategy: z.literal(RegisterStrategy.VK) }).merge(
    z.object({
      userId: z.number(),
      signature: z.string(),
    }),
  ),
  z.object({ strategy: z.literal(RegisterStrategy.External) }).merge(
    z.object({
      userId: z.number(),
      signature: z.string(),
    }),
  ),
])

export type RegisterCredentials = z.infer<typeof ZodRegisterCredentials>
