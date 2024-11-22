import { z } from 'zod';

const createPackageZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).min(1),
    price: z.number({ required_error: 'Price is required' }).min(1),
    features: z
      .array(z.string({ required_error: 'Features are required' }), {
        required_error: 'Features are required',
      })
      .min(1),
    allowedSpaces: z
      .number({ required_error: 'Allowed spaces are required' })
      .min(1),
  }),
});
const updatePackageZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    price: z.number().optional(),
    features: z.array(z.string()).optional(),
    allowedSpaces: z.number().optional(),
  }),
});
export const PackageValidation = {
  createPackageZodSchema,
  updatePackageZodSchema,
};
