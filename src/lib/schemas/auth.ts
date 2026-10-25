import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().trim().min(1, 'Please enter your email').email('Please enter a valid email'),
  password: z.string().min(1, 'Please enter your password'),
});

export type SignInInput = z.infer<typeof signInSchema>;

/**
 * Applied when hashing a new staff password (seed and any future user
 * management). Not applied at sign-in — an existing password must stay usable
 * even if the rule later tightens.
 */
export const passwordPolicySchema = z
  .string()
  .min(12, 'Use at least 12 characters')
  .regex(/[a-z]/, 'Include a lowercase letter')
  .regex(/[A-Z]/, 'Include an uppercase letter')
  .regex(/\d/, 'Include a digit');
