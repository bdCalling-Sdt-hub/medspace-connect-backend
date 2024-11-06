import { z } from 'zod';
export const LinksValidation = {
  createLinksZodSchema: z.object({
    body: z.object({
      icon: z.string({
        required_error: 'icon is required',
        invalid_type_error: 'icon should be type string',
      }),
      url: z.string({
        required_error: 'url is required',
        invalid_type_error: 'url should be type string',
      }),
    }),
  }),
  updateLinksZodSchema: z.object({
    body: z.object({
      icon: z
        .string({ invalid_type_error: 'icon should be type string' })
        .optional(),
      url: z
        .string({ invalid_type_error: 'url should be type string' })
        .optional(),
    }),
  }),
};
