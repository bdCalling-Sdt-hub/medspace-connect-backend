import { z } from 'zod';

const createCouponZodSchema = z.object({
  body: z.object({
    percent_off: z.number({
      required_error: 'percent_off is required',
      invalid_type_error: 'percent_off should be type number',
    }),
    max_redemptions: z.number({
      required_error: 'max_redemptions is required',
      invalid_type_error: 'max_redemptions should be type number',
    }),
    redeem_by: z.number({
      required_error: 'redeem_by is required',
      invalid_type_error: 'redeem_by should be type number',
    }),
    name: z.string({
      required_error: 'name is required',
      invalid_type_error: 'name should be type string',
    }),
    usageInterval: z.string({
      required_error: 'usageInterval is required',
      invalid_type_error: 'usageInterval should be type string',
    }),
  }),
});

const updateCouponZodSchema = z.object({
  body: z.object({
    percent_off: z
      .number({ invalid_type_error: 'percent_off should be type number' })
      .optional(),
    max_redemptions: z
      .number({ invalid_type_error: 'max_redemptions should be type number' })
      .optional(),
    redeem_by: z
      .number({ invalid_type_error: 'redeem_by should be type number' })
      .optional(),
    usageInterval: z
      .string({ invalid_type_error: 'usageInterval should be type string' })
      .optional(),
    name: z
      .string({ invalid_type_error: 'name should be type string' })
      .optional(),
  }),
});

export const CouponValidation = {
  createCouponZodSchema,
  updateCouponZodSchema,
};
