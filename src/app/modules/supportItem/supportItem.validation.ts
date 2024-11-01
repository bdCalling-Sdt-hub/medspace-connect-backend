import { z } from 'zod';
// Define your validation schema here
const createSupportItemZodSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }),
    type: z.string({ required_error: 'Type is required' }),
    description: z.string({ required_error: 'Description is required' }),
  }),
});
const updateSupportItemZodSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    type: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
  }),
});
export const SupportItemValidation = {
  createSupportItemZodSchema,
  updateSupportItemZodSchema,
};
