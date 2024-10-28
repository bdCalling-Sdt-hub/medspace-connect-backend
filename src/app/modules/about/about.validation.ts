import { z } from 'zod';
// Define your validation schema here
export const createAboutZodSchema = z.object({
  title: z.string({ required_error: 'Title is required' }),
  description: z.string({ required_error: 'Description is required' }),
  image: z.string().optional(),
});

export const updateAboutZodSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
});
export const AboutValidation = { createAboutZodSchema, updateAboutZodSchema };
