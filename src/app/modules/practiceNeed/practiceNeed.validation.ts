import { z } from 'zod';
      
const createPracticeNeedZodSchema = z.object({
  body: z.object({
    need: z.string({ required_error:"need is required", invalid_type_error:"need should be type string" })
  }),
});

const updatePracticeNeedZodSchema = z.object({
  body: z.object({
    need: z.string({ invalid_type_error:"need should be type string" }).optional()
  }),
});

export const PracticeNeedValidation = {
  createPracticeNeedZodSchema,
  updatePracticeNeedZodSchema
};
