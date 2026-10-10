import express from 'express';
import { protect, restrictTo } from '../users/auth.controller.js';
import { createReview, deleteReview, getAllReviews, getReviewById, setTourUserIds, updateReview, } from './review.controller.js';
const router = express.Router({ mergeParams: true });
router.use(protect);
router
    .route('/')
    .get(getAllReviews)
    .post(restrictTo('user'), setTourUserIds, createReview);
router
    .route('/:id')
    .get(getReviewById)
    .patch(restrictTo('user', 'admin'), updateReview)
    .delete(restrictTo('user', 'admin'), deleteReview);
export default router;
