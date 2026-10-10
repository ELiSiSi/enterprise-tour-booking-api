import { protect, isLoggedIn, restrictTo } from '../users/auth.controller.js';

import express from 'express';
const router = express.Router();

import {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  updateUserData,
  getMyTours,
  getSignupForm,
  getMyReviews,
  getBilling,
  getManageTours,
  getCreateTour,
  getManageUsers,
  getManageReviews,
  getManageBookings,
} from './view.controller.js';

import { createBookingCheckout } from '../bookings/booking.controller.js';


router.get('/', isLoggedIn, getOverview);
router.get('/tour/:slug', isLoggedIn, getTour);
router.get('/login', isLoggedIn, getLoginForm);
router.get('/singup', isLoggedIn, getSignupForm);
router.get('/me', protect, getAccount);
router.get('/my-tours', protect, getMyTours);
router.post('/submit-user-data', protect, updateUserData);

router.get('/my-reviews', protect, getMyReviews);
router.get('/billing', protect, getBilling);
router.use(protect, restrictTo('admin', 'lead-guide'));
router.get('/manage-tours', getManageTours);
router.get('/create-tour', getCreateTour);
router.get('/manage-users', getManageUsers);
router.get('/manage-reviews', getManageReviews);
router.get('/manage-bookings', getManageBookings);

export default router;
