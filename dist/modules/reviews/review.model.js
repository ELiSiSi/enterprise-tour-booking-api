import mongoose from 'mongoose';
import Tour from '../tours/tour.model.js';
const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review cannot be empty'],
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Rating is required'],
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour'],
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: [true, 'Review must belong to a user'],
    },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
reviewSchema.index({ user: 1, tour: 1 }, { unique: true });
//----------------------------------------------------------------------------------------
reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name photo',
    });
    next();
});
//----------------------------------------------------------------------------------------
reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId },
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' },
            },
        },
    ]);
    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating,
        });
    }
    else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5,
        });
    }
};
reviewSchema.post('save', async function () {
    await this.constructor.calcAverageRatings(this.tour);
});
reviewSchema.pre(/^findOneAnd/, async function () {
    this.r = await this.model
        .findOne(this.getQuery())
        .select('tour')
        .lean();
});
reviewSchema.post(/^findOneAnd/, async function () {
    const previousReview = this.r;
    if (previousReview) {
        await this.model.calcAverageRatings(previousReview.tour);
        const update = this.getUpdate?.();
        const nextTour = update?.tour ?? update?.$set?.tour;
        if (nextTour && nextTour.toString() !== previousReview.tour.toString()) {
            await this.model.calcAverageRatings(nextTour);
        }
    }
});
const Review = mongoose.model('Review', reviewSchema);
export default Review;
