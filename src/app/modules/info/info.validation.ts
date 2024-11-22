import { z } from 'zod';
import { INFO_NAME } from '../../../enums/info';

const createInfoZodSchema = z.object({
  body: z.object({
    name: z.enum([INFO_NAME.USERAGRREEMENT, INFO_NAME.TERMSANDCONDITIONS], {
      required_error: 'Name is required',
    }),
    content: z.string({ required_error: 'Content is required' }).regex(/.*/),
  }),
});
const updateInfoZodSchema = z.object({
  body: z.object({
    name: z
      .enum([INFO_NAME.USERAGRREEMENT, INFO_NAME.TERMSANDCONDITIONS])
      .optional(),
    content: z.string().regex(/.*/).optional(),
  }),
});

export const InfoValidation = { createInfoZodSchema, updateInfoZodSchema };
