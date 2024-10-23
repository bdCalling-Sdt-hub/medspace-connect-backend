import { z } from 'zod';

const createSpaceZodSchema = z.object({
  title: z.string({ required_error: 'title is required' }),
  price: z.number({ required_error: 'price is required' }),
  priceType: z.string({ required_error: 'priceType is required' }),
  location: z.string({ required_error: 'location is required' }),
  openingDate: z.string({ required_error: 'openingDate is required' }),
  practiceFor: z.string({ required_error: 'practiceFor is required' }),
  facilities: z.array(z.string({ required_error: 'facilities is required' })),
  description: z.string({ required_error: 'description is required' }),
});

const updateSpaceZodSchema = z.object({
  title: z.string({ invalid_type_error: 'title must be a string' }).optional(),
  price: z.number({ invalid_type_error: 'price must be a number' }).optional(),
  priceType: z
    .string({ invalid_type_error: 'priceType must be a string' })
    .optional(),
  location: z
    .string({ invalid_type_error: 'location must be a string' })
    .optional(),
  openingDate: z
    .string({ invalid_type_error: 'openingDate must be a string' })
    .optional(),
  practiceFor: z
    .string({ invalid_type_error: 'practiceFor must be a string' })
    .optional(),
  description: z
    .string({ invalid_type_error: 'description must be a string' })
    .optional(),
});

export const SpaceValidation = {
  createSpaceZodSchema,
  updateSpaceZodSchema,
};
