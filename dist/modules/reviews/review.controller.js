import asyncHandler from 'express-async-handler';
import Review from './review.model.js';
import { createOne, deleteOne, getOne, updateOne } from '../../shared/controllers/handlerFactory.js';
import AppError from '../../shared/utils/appError.js';
//----------------------------------------------------------------------------------------
export const setTourUserIds = (req, res, next) => {
    if (req.params.tourId)
        req.body.tour = req.params.tourId;
    req.body.user = req.user.id;
    next();
};
export const checkReviewOwnership = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id);
    if (!review)
        return next(new AppError('No review found with that ID', 404));
    const reviewUserId = review.user.id || review.user._id || review.user;
    if (req.user.role !== 'admin' && reviewUserId.toString() !== req.user.id) {
        return next(new AppError('You do not have permission to edit or delete this review', 403));
    }
    next();
});
export const createReview = createOne(Review);
//----------------------------------------------------------------------------------------
export const getAllReviews = asyncHandler(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId)
        filter = { tour: req.params.tourId };
    const reviews = await Review.find(filter);
    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews,
        },
    });
});
//----------------------------------------------------------------------------------------
export const getReviewById = getOne(Review, undefined);
//----------------------------------------------------------------------------------------
export const updateReview = updateOne(Review);
//----------------------------------------------------------------------------------------
export const deleteReview = deleteOne(Review);
