import 'dotenv/config';
import asyncHandler from 'express-async-handler';
import Stripe from 'stripe';

import Tour from '../tours/tour.model.js';
import Booking from './booking.model.js';
import AppError from '../../shared/utils/appError.js';
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from '../../shared/controllers/handlerFactory.js';

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
  const { tour, user, price } = req.query

  if(!tour && !user && !price ) return next()

await Booking.create({tour,user,price})

  res.redirect(req.originalUrl.split('?')[0]);

}

//----------------------------------------------------------------------------------------
export const createBooking = createOne(Booking)

//----------------------------------------------------------------------------------------
export const getBooking = getOne(Booking)

//----------------------------------------------------------------------------------------
export const getAllBooking =  getAll(Booking)

//----------------------------------------------------------------------------------------
export const updateBooking = updateOne(Booking)

//----------------------------------------------------------------------------------------
export const deleteBooking = deleteOne(Booking)
