import { z } from 'zod';
import { USER_ROLES } from '../../../enums/user';

const createUserZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    contact: z.string({ required_error: 'Contact is required' }),
    role: z.enum(
      [USER_ROLES.ADMIN, USER_ROLES.SPACEPROVIDER, USER_ROLES.SPACESEEKER],
      {
        required_error: 'Role is required',
      }
    ),
    email: z.string({ required_error: 'Email is required' }),
    password: z.string({ required_error: 'Password is required' }),
    // location: z.string({ required_error: 'Location is required' }),
    profile: z.string().optional(),
  }),
});

export const UserValidation = {
  createUserZodSchema,
};
