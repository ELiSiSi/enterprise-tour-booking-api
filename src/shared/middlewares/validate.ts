import { z } from 'zod';
import AppError from '../utils/appError.js';

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err: any) {
    let errorMessage = 'Validation failed';
    if (err.errors && Array.isArray(err.errors)) {
      errorMessage = err.errors.map((e: any) => e.message).join(', ');
    }
    return next(new AppError(`Validation Error: ${errorMessage}`, 400));
  }
};
