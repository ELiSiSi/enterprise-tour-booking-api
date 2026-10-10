import mongoose from 'mongoose';
const sessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: true,
    },
    refreshTokenHash: {
        type: String,
        required: true,
        select: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    deviceInfo: {
        ip: String,
        userAgent: String,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    lastUsedAt: {
        type: Date,
        default: Date.now,
    },
    mfaVerified: {
        type: Boolean,
        default: false,
    },
    revokedAt: Date,
    revokedBy: {
        type: String,
        enum: ['user', 'system', 'rotation', 'admin'],
    },
}, { timestamps: true });
// Method to revoke a session
sessionSchema.methods.revoke = async function (by = 'system') {
    this.isActive = false;
    this.revokedAt = new Date();
    this.revokedBy = by;
    await this.save({ validateBeforeSave: false });
};
export default mongoose.model('Session', sessionSchema);
