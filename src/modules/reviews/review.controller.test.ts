import mongoose from 'mongoose';
import { describe, expect, it, vi } from 'vitest';

import Review from './review.model.js';
import { checkReviewOwnership, setTourUserIds } from './review.controller.js';
import User from '../users/user.model.js';
import Tour from '../tours/tour.model.js';

describe('Review authorization', () => {
  it('always uses the authenticated user and nested tour instead of request body IDs', () => {
    const req: any = {
      body: { user: new mongoose.Types.ObjectId().toString(), tour: 'attacker-tour' },
      params: { tourId: 'trusted-tour' },
      user: { id: 'authenticated-user' },
    };
    const next = vi.fn();

    setTourUserIds(req, {} as any, next);

    expect(req.body.user).toBe('authenticated-user');
    expect(req.body.tour).toBe('trusted-tour');
    expect(next).toHaveBeenCalledWith();
  });

  it('rejects review changes by a different user', async () => {
    const owner = await User.create({
      name: 'Review Owner',
      email: 'review-owner@example.com',
      password: 'password123',
      passwordConfirm: 'password123',
    });
    const otherUser = await User.create({
      name: 'Other Reviewer',
      email: 'other-reviewer@example.com',
      password: 'password123',
      passwordConfirm: 'password123',
    });
    const review = await Review.create({
      review: 'A review for an authorization test.',
      rating: 5,
      tour: new mongoose.Types.ObjectId(),
      user: owner._id,
    });
    const next = vi.fn();

    await checkReviewOwnership(
      { params: { id: review._id.toString() }, user: { id: otherUser.id, role: 'user' } } as any,
      {} as any,
      next
    );

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });

  it('allows an administrator to change another user review', async () => {
    const owner = await User.create({
      name: 'Review Owner',
      email: 'review-owner-admin-test@example.com',
      password: 'password123',
      passwordConfirm: 'password123',
    });
    const review = await Review.create({
      review: 'A review for an admin authorization test.',
      rating: 5,
      tour: new mongoose.Types.ObjectId(),
      user: owner._id,
    });
    const next = vi.fn();

    await checkReviewOwnership(
      { params: { id: review._id.toString() }, user: { id: new mongoose.Types.ObjectId().toString(), role: 'admin' } } as any,
      {} as any,
      next
    );

    expect(next).toHaveBeenCalledWith();
  });

  it('recalculates tour ratings after review creation, update, and deletion', async () => {
    const user = await User.create({
      name: 'Rating User',
      email: 'rating-user@example.com',
      password: 'password123',
      passwordConfirm: 'password123',
    });
    const tour = await Tour.create({
      name: 'A Tour For Rating Calculations',
      duration: 3,
      maxGroupSize: 10,
      difficulty: 'medium',
      price: 250,
      summary: 'A tour to verify calculated review ratings.',
      imageCover: 'rating-test.jpg',
      startLocation: { type: 'Point', coordinates: [0, 0] },
    });

    const review = await Review.create({
      review: 'A rating calculation test.',
      rating: 3,
      tour: tour._id,
      user: user._id,
    });
    let updatedTour = await Tour.findById(tour._id);
    expect(updatedTour?.ratingsQuantity).toBe(1);
    expect(updatedTour?.ratingsAverage).toBe(3);

    await Review.findByIdAndUpdate(review._id, { rating: 5 }, { runValidators: true });
    updatedTour = await Tour.findById(tour._id);
    expect(updatedTour?.ratingsQuantity).toBe(1);
    expect(updatedTour?.ratingsAverage).toBe(5);

    await Review.findByIdAndDelete(review._id);
    updatedTour = await Tour.findById(tour._id);
    expect(updatedTour?.ratingsQuantity).toBe(0);
    expect(updatedTour?.ratingsAverage).toBe(4.5);
  });
});
