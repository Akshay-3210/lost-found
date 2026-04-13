import { z } from 'zod';

export const userMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'Message is required')
    .max(500, 'Message must be 500 characters or less'),
});

export type UserMessageInput = z.infer<typeof userMessageSchema>;
