import express from 'express';
import { protect, restrictTo } from '../users/auth.controller.js';
import { createTour, deleteTour, getTour, getTourById, getToursWithin, getDistances, updateTour, resizeTourImages, uploadTourImages, } from './tour.controller.js';
import reviewRouter from '../reviews/review.routes.js';
const router = express.Router();
router.use(protect);
router.use('/:tourId/reviews', reviewRouter);
router
    .route('/tour-within/:distance/center/:latlng/unit/:unit')
    .get(getToursWithin);
router.route('/distances/:latlng/unit/:unit').get(getDistances);
router
    .route('/')
    .get(getTour)
    .post(restrictTo('admin', 'lead-guide'), createTour);
router
    .route('/:id')
    .get(getTourById)
    .patch(restrictTo('admin', 'lead-guide'), uploadTourImages, resizeTourImages, updateTour)
    .delete(restrictTo('admin', 'lead-guide'), deleteTour);
export default router;
