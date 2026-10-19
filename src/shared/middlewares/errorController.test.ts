import { afterEach, describe, expect, it, vi } from 'vitest';
import errorController from './errorController.js';

describe('Error middleware', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('hides internal errors in production and returns the request ID', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const res: any = {
      locals: { requestId: 'request-123' },
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    errorController(
      new Error('MongoDB password leaked'),
      { method: 'GET', originalUrl: '/api/v1/tours' },
      res,
      vi.fn()
    );

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Something went wrong. Please try again later.',
      requestId: 'request-123',
    });
  });
});
