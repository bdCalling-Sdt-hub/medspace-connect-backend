import { z } from 'zod';

const createAdminZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    password: z.string().optional(),
  }),
});

export const AdminValidation = {
  createAdminZodSchema,
};
