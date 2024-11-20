import { z } from 'zod';
      
const createPracticeTypeZodSchema = z.object({
  body: z.object({
    type: z.string({ required_error:"type is required", invalid_type_error:"type should be type string" })
  }),
});

const updatePracticeTypeZodSchema = z.object({
  body: z.object({
    type: z.string({ invalid_type_error:"type should be type string" }).optional()
  }),
});

export const PracticeTypeValidation = {
  createPracticeTypeZodSchema,
  updatePracticeTypeZodSchema
};
