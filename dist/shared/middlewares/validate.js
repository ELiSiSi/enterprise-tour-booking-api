import AppError from '../utils/appError.js';
export const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    }
    catch (err) {
        const errorMessage = err.errors.map((e) => e.message).join(', ');
        return next(new AppError(`Validation Error: ${errorMessage}`, 400));
    }
};
