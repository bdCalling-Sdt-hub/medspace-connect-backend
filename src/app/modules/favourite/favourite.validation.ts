import { z } from 'zod';
const createFavouriteZodSchema = z.object({
  body: z.object({
    spaceId: z.string().optional(),
  }),
});
export const FavouriteValidation = { createFavouriteZodSchema };
