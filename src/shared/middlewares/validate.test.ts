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

  it('applies parsed and transformed values to the request', () => {
    const schema = z.object({
      body: z.object({ name: z.string().trim() }),
      query: z.object({ page: z.coerce.number() }),
      params: z.object({ id: z.string() }),
    });
    const req: any = {
      body: { name: '  Tour  ' },
      query: { page: '3' },
      params: { id: 'tour-id' },
    };
    const next = vi.fn();

    validate(schema)(req, {}, next);

    expect(req.body.name).toBe('Tour');
    expect(req.query.page).toBe(3);
    expect(next).toHaveBeenCalledWith();
  });
});
