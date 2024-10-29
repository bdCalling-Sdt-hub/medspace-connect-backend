import { z } from 'zod';

const createInfoZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    content: z.string({ required_error: 'Content is required' }),
  }),
});
const updateInfoZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    content: z.string().optional(),
  }),
});

export const InfoValidation = { createInfoZodSchema, updateInfoZodSchema };
