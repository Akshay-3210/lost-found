import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60, 'Name must be 60 characters or less'),
  phone: z.string().max(30, 'Phone number must be 30 characters or less').optional().or(z.literal('')),
  location: z.string().max(80, 'Location must be 80 characters or less').optional().or(z.literal('')),
  bio: z.string().max(280, 'Bio must be 280 characters or less').optional().or(z.literal('')),
  image: z.string().url('Profile image must be a valid URL').optional().or(z.literal('')),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
