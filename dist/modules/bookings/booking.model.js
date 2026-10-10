import mongoose from 'mongoose';
import Tour from '../tours/tour.model.js';
const BookingSchema = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: Tour,
        required: [true, 'Booking must belong to a Tour'],
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: [true, 'Booking must belong to a user'],
    },
    price: {
        type: Number,
        required: [true, 'Booking must have a price'],
    },
    paid: {
        type: Boolean,
        default: true,
    },
    stripeSessionId: {
        type: String,
        unique: true,
        sparse: true
    }
}, { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true });
BookingSchema.pre(/^find/, function (next) {
    this.populate('user').populate({
        path: 'tour',
        select: "name"
    });
    next();
});
const Booking = mongoose.model('Booking', BookingSchema);
export default Booking;
