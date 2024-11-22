import { z } from 'zod';

const createFaqZodSchema = z.object({
  body: z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
  }),
});
const updateFaqZodSchema = z.object({
  body: z.object({
    question: z.string().min(1).optional(),
    answer: z.string().min(1).optional(),
  }),
});
export const FaqValidation = { createFaqZodSchema, updateFaqZodSchema };
