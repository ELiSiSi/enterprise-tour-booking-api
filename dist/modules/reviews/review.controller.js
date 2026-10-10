import asyncHandler from 'express-async-handler';
import Review from './review.model.js';
import { createOne, deleteOne, getOne, updateOne } from '../../shared/controllers/handlerFactory.js';
//----------------------------------------------------------------------------------------
export const setTourUserIds = (req, res, next) => {
    if (!req.body.tour)
        req.body.tour = req.params.tourId;
    if (!req.body.user)
        req.body.user = req.user.id;
    next();
};
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
export const getReviewById = getOne(Review);
//----------------------------------------------------------------------------------------
export const updateReview = updateOne(Review);
//----------------------------------------------------------------------------------------
export const deleteReview = deleteOne(Review);
