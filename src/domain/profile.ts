import { z } from 'zod'
import { Account } from '@/domain/account'
import { Frequency } from '@/domain/enums/frequency'
import { Interests } from '@/domain/enums/interests'
import { LookingFor } from '@/domain/enums/looking-for'
import { MaritalStatus } from '@/domain/enums/marital-status'
import { Personality } from '@/domain/enums/personality'
import { Sex } from '@/domain/enums/sex'
import { latinAndCyrillic } from '@/utils/domain/latinAndCyrillic'

const Age = z
  .number()
  .int()
  .min(18, 'u so yong lol')
  .max(80, 'u so ancient senior')

export const ProfileInput = z.object({
  name: z.string().regex(latinAndCyrillic),

  age: Age,
  searchAgeBoundaries: z
    .array(Age)
    .length(2, 'Incorrect age boundaries')
    .optional(),

  sex: z.nativeEnum(Sex),
  height: z
    .number()
    .min(25, 'you so smol lol')
    .max(250, 'you so big lol')
    .nullish(),
  weight: z.number().min(25).max(500).nullish(),
  lookingFor: z.nativeEnum(LookingFor).default(LookingFor.Love).nullish(),
  maritalStatus: z.nativeEnum(MaritalStatus).nullish(),
  smoking: z.nativeEnum(Frequency).nullish(),
  alcohol: z.nativeEnum(Frequency).nullish(),
  personality: z.nativeEnum(Personality).nullish(),
  about: z.string().max(300).nullish(),
  interests: z.array(z.nativeEnum(Interests)).min(3).max(10),

  work: z
    .object({
      place: z.string().max(50).nullish(),
      position: z.string().max(25),
    })
    .optional(),
  graduate: z
    .object({
      place: z.string().max(50).nullish(),
      speciality: z.string().max(25),
    })
    .optional(),

  contacts: z
    .object({
      instagram: z.string().nullable(),
      telegram: z.string().nullable(),
      twitter: z.string().nullable(),
      vk: z.string().nullable(),
    })
    .partial()
    .refine(obj => Object.keys(obj).length > 0)
    .optional(),
})

export const Profile = z
  .object({
    id: z.number().int(),
    accountId: z.number().int(),
  })
  .merge(ProfileInput)

export const ProfilePatchInput = ProfileInput.partial()

export type ProfileInput = z.infer<typeof ProfileInput>
export type ProfilePatchInput = z.infer<typeof ProfilePatchInput>
export type Profile = z.infer<typeof Profile>

export const DEFAULT_AGE_DELTA = 3
