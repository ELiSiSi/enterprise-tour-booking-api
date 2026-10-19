import AppError from '../utils/appError.js';
import { logger } from '../utils/logger.js';

const normalizeError = (err: any) => {
  if (err.name === 'CastError') {
    return new AppError(`Invalid value for ${err.path}.`, 400);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return new AppError(
      field ? `A record with this ${field} already exists.` : 'Duplicate field value.',
      409
    );
  }

  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors || {})
      .map((item: any) => item.message)
      .join('. ');
    return new AppError(`Invalid input data. ${details}`, 400);
  }

  if (err.name === 'JsonWebTokenError') {
    return new AppError('Invalid authentication token.', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return new AppError('Your token has expired. Please log in again.', 401);
  }

  if (err instanceof SyntaxError && 'body' in err) {
    return new AppError('Malformed JSON request body.', 400);
  }

  return err;
};

export default (err: any, req: any, res: any, next: any) => {
  if (res.headersSent) return next(err);

  const error = normalizeError(err);
  const statusCode = Number(error.statusCode) || 500;
  const status = error.status || (statusCode < 500 ? 'fail' : 'error');
  const requestId = res.locals.requestId;
  const isOperational = error.isOperational === true;

  if (!isOperational) {
    logger.error('Unhandled request error', {
      requestId,
      method: req.method,
      path: req.originalUrl,
      error,
    });
  }

  const message =
    process.env.NODE_ENV === 'development' || isOperational
      ? error.message
      : 'Something went wrong. Please try again later.';

  if (req.originalUrl.startsWith('/api')) {
    return res.status(statusCode).json({
      status,
      message,
      requestId,
      ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {}),
    });
  }

  return res.status(statusCode).render('error', {
    title: 'Something went wrong!',
    msg: message,
    requestId,
  });
};
