import 'dotenv/config';
import asyncHandler from 'express-async-handler';
import Stripe from 'stripe';
import mongoose from 'mongoose';

import Tour from '../tours/tour.model.js';
import User from '../users/user.model.js';
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

  const session = await (stripe.checkout.sessions.create as any)({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourID,
    metadata: {
      tourId: tour._id.toString(),
      userId: req.user.id.toString(),
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
          unit_amount: Math.round(tour.price * 100),
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
export const createBooking = createOne(Booking)

//----------------------------------------------------------------------------------------
export const getBooking = getOne(Booking, undefined)

//----------------------------------------------------------------------------------------
export const getAllBooking =  getAll(Booking)

//----------------------------------------------------------------------------------------
export const updateBooking = updateOne(Booking)

//----------------------------------------------------------------------------------------
export const deleteBooking = deleteOne(Booking)

export const webhookCheckout = asyncHandler(async (req: any, res: any, next: any) => {
  const signature = req.headers['stripe-signature'];
  if (typeof signature !== 'string') {
    return res.status(400).json({ status: 'fail', message: 'Missing Stripe signature.' });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    return res.status(400).json({ status: 'fail', message: `Webhook signature verification failed: ${err.message}` });
  }

  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== 'paid') {
    return res.status(200).json({ received: true });
  }

  const tourId = session.metadata?.tourId;
  const userId = session.metadata?.userId;
  if (
    session.mode !== 'payment' ||
    session.currency !== 'usd' ||
    !session.id ||
    !tourId ||
    !userId ||
    !mongoose.Types.ObjectId.isValid(tourId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    return res.status(400).json({
      status: 'fail',
      message: 'The completed checkout session is missing valid booking details.',
    });
  }

  const [tour, user] = await Promise.all([
    Tour.findById(tourId),
    User.findById(userId),
  ]);
  if (!tour || !user) {
    return res.status(400).json({
      status: 'fail',
      message: 'The checkout session references an unknown tour or user.',
    });
  }

  const expectedAmount = Math.round(tour.price * 100);
  if (session.amount_total !== expectedAmount) {
    return res.status(400).json({
      status: 'fail',
      message: 'The checkout amount does not match the tour price.',
    });
  }

  await Booking.updateOne(
    { stripeSessionId: session.id },
    {
      $setOnInsert: {
        tour: tour._id,
        user: user._id,
        price: tour.price,
        paid: true,
        stripeSessionId: session.id,
      },
    },
    { upsert: true }
  );

  return res.status(200).json({ received: true });
});
