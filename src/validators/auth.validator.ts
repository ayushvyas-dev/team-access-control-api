import z from 'zod';

export const registerUserSchema = z.object({
    name: z.string().trim().min(3, 'Name must be at least 3 characters long'),
    email: z.string().trim().email('Invalid email'),
    password: z.string().trim().min(8, 'Password must be at least 8 characters long').max(30, 'Password cannot exceed 30 characters')
})

export const loginUserSchema = z.object({
    email: z.string().trim().email('Invalid email'),
    password: z.string().trim().min(8, 'Password must be at least 8 characters long').max(30, 'Password cannot exceed 30 characters')
})

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;