import express from 'express';
import request from 'supertest';
import Stripe from 'stripe';
import { beforeEach, describe, expect, it } from 'vitest';

import Booking from './booking.model.js';
import Tour from '../tours/tour.model.js';
import User from '../users/user.model.js';
import { webhookCheckout } from './booking.controller.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const app = express();
let receivedPayload: Buffer;
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    receivedPayload = req.body;
    next();
  },
  webhookCheckout
);

describe('Stripe checkout webhook', () => {
  let tour;
  let user;

  beforeEach(async () => {
    user = await User.create({
      name: 'Checkout Test User',
      email: 'checkout-test@example.com',
      password: 'password123',
      passwordConfirm: 'password123',
    });

    tour = await Tour.create({
      name: 'Checkout Test Tour',
      duration: 3,
      maxGroupSize: 10,
      difficulty: 'medium',
      price: 250,
      summary: 'A tour used for checkout webhook tests.',
      imageCover: 'checkout-test.jpg',
      startLocation: {
        type: 'Point',
        coordinates: [0, 0],
      },
    });
  });

  const makeEvent = (overrides = {}) => ({
    id: 'evt_checkout_test',
    object: 'event',
    api_version: null,
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: 'cs_checkout_test',
        object: 'checkout.session',
        amount_total: 25000,
        currency: 'usd',
        metadata: {
          tourId: tour._id.toString(),
          userId: user._id.toString(),
        },
        mode: 'payment',
        payment_status: 'paid',
        ...overrides,
      },
    },
    livemode: false,
    pending_webhooks: 1,
    request: null,
    type: 'checkout.session.completed',
  }) as unknown as Stripe.Event;

  const sendEvent = async (event: Stripe.Event, secret = webhookSecret) => {
    const payload = JSON.stringify(event);
    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret,
    });

    const response = await request(app)
      .post('/webhook-checkout')
      .set('stripe-signature', signature)
      .set('content-type', 'application/json')
      .send(payload);

    expect(receivedPayload.toString('utf8')).toBe(payload);
    return response;
  };

  it('creates a booking only for a paid session with matching tour amount and currency', async () => {
    const response = await sendEvent(makeEvent());

    expect(response.status, JSON.stringify(response.body)).toBe(200);
    const bookings = await Booking.find({ stripeSessionId: 'cs_checkout_test' });
    expect(bookings).toHaveLength(1);
    expect(bookings[0].tour._id.toString()).toBe(tour._id.toString());
    expect(bookings[0].user._id.toString()).toBe(user._id.toString());
    expect(bookings[0].price).toBe(tour.price);
    expect(bookings[0].paid).toBe(true);
  });

  it('does not create duplicate bookings when Stripe retries a session event', async () => {
    const event = makeEvent();

    expect((await sendEvent(event)).status).toBe(200);
    expect((await sendEvent(event)).status).toBe(200);
    expect(await Booking.countDocuments({ stripeSessionId: 'cs_checkout_test' })).toBe(1);
  });

  it('rejects a completed session whose amount does not match the tour price', async () => {
    const response = await sendEvent(makeEvent({ amount_total: 1 }));

    expect(response.status).toBe(400);
    expect(await Booking.countDocuments()).toBe(0);
  });

  it('rejects a webhook with an invalid signature', async () => {
    const response = await sendEvent(makeEvent(), 'whsec_invalid_signature');

    expect(response.status).toBe(400);
    expect(await Booking.countDocuments()).toBe(0);
  });

  it('acknowledges an unpaid session without creating a booking', async () => {
    const response = await sendEvent(makeEvent({ payment_status: 'unpaid' }));

    expect(response.status).toBe(200);
    expect(await Booking.countDocuments()).toBe(0);
  });
});
