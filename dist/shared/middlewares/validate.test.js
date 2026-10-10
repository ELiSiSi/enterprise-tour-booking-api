import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { validate } from './validate.js';
describe('Validate Middleware', () => {
    it('should call next() if validation passes', () => {
        const schema = z.object({
            body: z.object({
                name: z.string(),
            }),
        });
        const req = { body: { name: 'Test' }, query: {}, params: {} };
        const res = {};
        const next = vi.fn();
        const middleware = validate(schema);
        middleware(req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(); // Called without arguments (no error)
    });
    it('should call next() with AppError if validation fails', () => {
        const schema = z.object({
            body: z.object({
                age: z.number(),
            }),
        });
        const req = { body: { age: 'not_a_number' }, query: {}, params: {} };
        const res = {};
        const next = vi.fn();
        const middleware = validate(schema);
        middleware(req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls[0][0].statusCode).toBe(400);
        expect(next.mock.calls[0][0].message).toContain('Validation Error');
    });
});
