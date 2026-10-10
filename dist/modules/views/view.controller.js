import asyncHandler from 'express-async-handler';
import AppError from '../../shared/utils/appError.js';
import Tour from '../tours/tour.model.js';
import User from '../users/user.model.js';
import Booking from '../bookings/booking.model.js';
import Review from '../reviews/review.model.js';
//----------------------------------------------------------------------------------------
export const getOverview = asyncHandler(async (req, res, next) => {
    // 1) Get tour data from collection
    const tours = await Tour.find();
    res.status(200).render('overview', {
        title: 'All Tours',
        tours,
        stripePublicKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
});
//----------------------------------------------------------------------------------------
export const getTour = asyncHandler(async (req, res, next) => {
    // 1) Get the data, for the requested tour (including reviews and guides)
    const tour = await Tour.findOne({ slug: req.params.slug })
        .populate({
        path: 'guides',
        select: 'name photo role -_id',
    })
        .populate({
        path: 'reviews',
        select: 'review rating user createdAt', // أضف createdAt لو عايز التاريخ
        populate: {
            path: 'user', // ← ده اللي هيجيب الاسم والصورة
            select: 'name photo', // اختار الحقول اللي عايزها فقط
        },
    });
    if (!tour) {
        return next(new AppError('There is no tour with that name.', 404));
    }
    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour,
    });
});
//----------------------------------------------------------------------------------------
export const getLoginForm = asyncHandler(async (req, res, next) => {
    res.status(200).render('login', {
        title: 'Log into your account',
    });
});
//----------------------------------------------------------------------------------------
export const getSignupForm = asyncHandler(async (req, res, next) => {
    res.status(200).render('signup', {
        title: 'Sign up your account',
    });
});
//----------------------------------------------------------------------------------------
export const getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Your account',
    });
};
//----------------------------------------------------------------------------------------
export const updateUserData = asyncHandler(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        email: req.body.email,
    }, {
        new: true,
        runValidators: true,
    });
    res.status(200).redirect('/me');
});
//----------------------------------------------------------------------------------------
export const getMyTours = asyncHandler(async (req, res, next) => {
    // 1) Find all bookings
    const bookings = await Booking.find({ user: req.user.id }); // req.user.id is the user's ID
    // 2) Find tours with the returned IDs
    const tourIDs = bookings.map((el) => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIDs } });
    res.status(200).render('overview', {
        title: 'My Tours',
        tours,
    });
});
export const getMyReviews = asyncHandler(async (req, res, next) => {
    const reviews = await Review.find({ user: req.user.id }).populate({ path: 'tour', select: 'name imageCover' });
    res.status(200).render('my-reviews', { title: 'My Reviews', reviews });
});
export const getBilling = (req, res) => {
    res.status(200).render('billing', { title: 'Billing & Invoices' });
};
export const getManageTours = asyncHandler(async (req, res, next) => {
    const tours = await Tour.find();
    res.status(200).render('manage-tours', { title: 'Manage Tours', tours });
});
export const getCreateTour = (req, res) => {
    res.status(200).render('create-tour', { title: 'Create New Tour' });
};
export const getManageUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find();
    res.status(200).render('manage-users', { title: 'Manage Users', users });
});
export const getManageReviews = asyncHandler(async (req, res, next) => {
    const reviews = await Review.find().populate({ path: 'tour', select: 'name' });
    res.status(200).render('manage-reviews', { title: 'Manage Reviews', reviews });
});
export const getManageBookings = asyncHandler(async (req, res, next) => {
    const bookings = await Booking.find().populate({ path: 'tour', select: 'name' }).populate({ path: 'user', select: 'name' });
    res.status(200).render('manage-bookings', { title: 'Manage Bookings', bookings });
});
