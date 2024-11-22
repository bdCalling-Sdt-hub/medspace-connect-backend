import { z } from 'zod';

const sendNotificationToReceiverZodSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    message: z.string().min(1),
    receiverId: z.string().optional(),
    type: z.enum(['message', 'normal']).optional(),
    data: z.object({}).optional(),
  }),
});

export const NotificationValidation = {
  sendNotificationToReceiverZodSchema,
};
