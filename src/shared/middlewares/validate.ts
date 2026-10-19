import { z } from 'zod';
import AppError from '../utils/appError.js';

export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    req.body = parsed.body;
    req.params = parsed.params;
    Object.defineProperty(req, 'query', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: parsed.query,
    });
    next();
  } catch (err: any) {
    let errorMessage = 'Validation failed';
    if (Array.isArray(err.issues)) {
      errorMessage = err.issues
        .map((issue: any) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');
    }
    return next(new AppError(`Validation Error: ${errorMessage}`, 400));
  }
};
