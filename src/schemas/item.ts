import { z } from 'zod';

export const createItemSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.enum(['lost', 'found']),
  status: z.enum(['active', 'resolved', 'claimed']).optional(),
  location: z.string().optional(),
  date: z.string().optional(),
  contactInfo: z.string().optional(),
  images: z.array(z.string().url()).optional(),
});

export const updateItemSchema = createItemSchema.partial();

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
