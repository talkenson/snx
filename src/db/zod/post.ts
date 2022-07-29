import * as z from 'zod'
import { ContentType } from '@prisma/client'
import { CompleteUser, RelatedUserModel } from './index'

export const PostModel = z.object({
  id: z.number().int(),
  authorId: z.number().int().nullish(),
  createdAt: z.date(),
  type: z.nativeEnum(ContentType),
  data: z.string(),
})

export interface CompletePost extends z.infer<typeof PostModel> {
  author?: CompleteUser | null
}

/**
 * RelatedPostModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedPostModel: z.ZodSchema<CompletePost> = z.lazy(() =>
  PostModel.extend({
    author: RelatedUserModel.nullish(),
  }),
)
