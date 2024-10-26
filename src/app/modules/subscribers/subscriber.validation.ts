import { z } from 'zod';

const createSubscriberZodSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const SubscriberValidation = {
  createSubscriberZodSchema,
};
