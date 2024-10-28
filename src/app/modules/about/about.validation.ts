import { z } from 'zod';
// Define your validation schema here
export const createAboutZodSchema = z.object({
  title: z.string({ required_error: 'Title is required' }),
  description: z.string({ required_error: 'Description is required' }),
  image: z.string().optional(),
});
export const AboutValidation = { createAboutZodSchema };
