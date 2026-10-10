import { z } from 'zod';
export const signupSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        passwordConfirm: z.string()
    }).refine((data) => data.password === data.passwordConfirm, {
        message: "Passwords don't match",
        path: ['passwordConfirm'],
    })
});
export const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required')
    })
});
