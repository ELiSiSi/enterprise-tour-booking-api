import path from 'path';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import compression from 'compression';
import AppError from './shared/utils/appError.js';
import userRouter from './modules/users/user.routes.js';
import tourRouter from './modules/tours/tour.routes.js';
import reviewRouter from './modules/reviews/review.routes.js';
import bookingRouter from './modules/bookings/booking.routes.js';
import viewRouter from './modules/views/view.routes.js';
import { setupSwagger } from './shared/config/swagger.config.js';
const MONGO_URI = process.env.MONGO_URI;
const app = express();
const port = process.env.PORT || 3000;
setupSwagger(app);
// حل مشكلة __dirname في ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.static(path.join(process.cwd(), 'public')));
//-----------------------------------------------------------------------------------------
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);
// ✅ Middleware للـ nonce و stripePublicKey
app.use((req, res, next) => {
    res.locals.cspNonce = crypto.randomBytes(16).toString('base64');
    res.locals.stripePublicKey = process.env.STRIPE_PUBLISHABLE_KEY;
    next();
});
// Set Security HTTP Headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                'https://js.stripe.com',
                (req, res) => `'nonce-${res.locals.cspNonce}'`,
            ],
            scriptSrcElem: [
                "'self'",
                'https://js.stripe.com',
                (req, res) => `'nonce-${res.locals.cspNonce}'`, // ✅ إضافة nonce هنا
            ],
            scriptSrcAttr: [(req, res) => `'nonce-${res.locals.cspNonce}'`], // ✅ مهم جداً!
            frameSrc: ["'self'", 'https://js.stripe.com'],
            connectSrc: ["'self'", 'https://api.stripe.com'],
            imgSrc: ["'self'", 'data:', 'https://*'],
            styleSrc: ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        },
    },
}));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
// 2) تنظيف البيانات من NoSQL Injection
app.use(mongoSanitize());
// 3) تنظيف البيانات من XSS Attack
app.use(xss());
//-----------------------------------------------------------------------------------------
// app.use(morgan('dev'));
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});
// 4)  يمنع تكرار نفس Query Parameter أكتر من مرة---------------------------------------------------------
app.use(hpp({
    whitelist: [
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price',
    ],
}));
//-----------------------------------------------------------------------------------------
app.set('view engine', 'pug');
app.set('views', path.join(process.cwd(), 'views'));
//  تحميل أسرع للصفحات  استهلاك إنترنت أقل ---------------------------------------------------------
app.use(compression());
//-----------------------------------------------------------------------------------------
// ✅ Middleware لتمرير Stripe key لكل الصفحات
app.use((req, res, next) => {
    res.locals.stripePublicKey = process.env.STRIPE_PUBLISHABLE_KEY;
    next();
});
app.get('/.well-known/*', (req, res) => res.status(204).end());
app.use('/', viewRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter); // ✅ تصليح المسار
// 404 handler للـ routes اللي مش موجودة
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
// Global error handler (في الآخر!)
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }
    // عرض صفحة error
    res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message,
    });
});
//----------------------------------------------------------------------------------------------------------
process.on('unhandledRejection', (err) => {
    console.log('❌ Unhandled Rejection 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});
process.on('uncaughtException', (err) => {
    console.log('❌ Uncaught Exception 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});
//-----------------------------------------------------------------------------------------
mongoose
    .connect(MONGO_URI)
    .then(() => {
    console.log('✅ ');
    app.listen(port, () => {
        console.log(` app listening at http://localhost:${port}`);
    });
})
    .catch((err) => console.error('❌ MongoDB Error:', err));
export default app;
