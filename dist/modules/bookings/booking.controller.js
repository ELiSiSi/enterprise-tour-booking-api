import 'dotenv/config';
import asyncHandler from 'express-async-handler';
import Stripe from 'stripe';
import Tour from '../tours/tour.model.js';
import User from '../users/user.model.js';
import Booking from './booking.model.js';
import AppError from '../../shared/utils/appError.js';
import { createOne, deleteOne, getAll, getOne, updateOne, } from '../../shared/controllers/handlerFactory.js';
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('⚠️ STRIPE_SECRET_KEY is missing in .env file!');
}
//----------------------------------------------------------------------------------------
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const getCheckoutSession = asyncHandler(async (req, res, next) => {
    const tour = await Tour.findById(req.params.tourID);
    if (!tour) {
        return next(new AppError('No tour found with that ID', 404));
    }
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment', // مهم جدًا
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourID}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourID,
        metadata: {
            tourId: tour.id,
            userId: req.user.id
        },
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: `${tour.summary}`,
                        images: [
                            `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`,
                        ],
                    },
                    unit_amount: tour.price * 100, // السعر بالسنت
                },
                quantity: 1,
            },
        ],
    });
    res.status(200).json({
        status: 'success',
        session,
    });
});
//----------------------------------------------------------------------------------------
export const createBookingCheckout = async (req, res, next) => {
    const { tour, user, price } = req.query;
    if (!tour && !user && !price)
        return next();
    await Booking.create({ tour, user, price });
    res.redirect(req.originalUrl.split('?')[0]);
};
//----------------------------------------------------------------------------------------
export const createBooking = createOne(Booking);
//----------------------------------------------------------------------------------------
export const getBooking = getOne(Booking, undefined);
//----------------------------------------------------------------------------------------
export const getAllBooking = getAll(Booking);
//----------------------------------------------------------------------------------------
export const updateBooking = updateOne(Booking);
//----------------------------------------------------------------------------------------
export const deleteBooking = deleteOne(Booking);
export const webhookCheckout = asyncHandler(async (req, res, next) => {
    const signature = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    }
    catch (err) {
        return res.status(400).send(`Webhook error: ${err.message}`);
    }
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        if (session.payment_status === 'paid') {
            const tourId = session.metadata?.tourId || session.client_reference_id;
            const userId = session.metadata?.userId;
            const stripeSessionId = session.id;
            const userDoc = userId ? await User.findById(userId) : await User.findOne({ email: session.customer_email });
            if (userDoc && tourId) {
                const price = session.amount_total / 100;
                try {
                    await Booking.create({ tour: tourId, user: userDoc.id, price, stripeSessionId });
                }
                catch (dbError) {
                    if (dbError.code === 11000) {
                        // Duplicate key error, meaning this session was already processed
                        console.log('Webhook event already processed');
                    }
                    else {
                        throw dbError;
                    }
                }
            }
        }
    }
    res.status(200).json({ received: true });
});
