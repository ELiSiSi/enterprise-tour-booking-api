import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
const Schema = mongoose.Schema;
const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email'],
    },
    photo: {
        type: String,
        default: 'default.png',
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user',
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 8,
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function (value) {
                return value === this.password;
            },
            message: 'Passwords do not match',
        },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
    mfaEnabled: {
        type: Boolean,
        default: false,
    },
    mfaSecret: {
        type: String,
        select: false,
    },
    mfaBackupCodes: {
        type: [String],
        select: false,
    },
    failedLoginAttempts: {
        type: Number,
        default: 0,
        select: false,
    },
    lockUntil: {
        type: Date,
        select: false,
    },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
//--------------------------------------------------------------------------------------------
userSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || this.isNew)
        return next();
    this.passwordChangedAt = new Date(Date.now() - 1000);
    this.passwordConfirm = undefined;
    next();
});
userSchema.pre(/^find/, async function (next) {
    this.find({ active: { $ne: false } });
    next();
});
//--------------------------------------------------------------------------------------------
userSchema.methods.correctPassword = async function (candidPassword, userPassword) {
    return await bcrypt.compare(candidPassword, userPassword);
};
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
};
// --- Advanced Auth Methods ---
userSchema.methods.isLocked = function () {
    return !!(this.lockUntil && this.lockUntil.getTime() > Date.now());
};
userSchema.methods.incrementLoginAttempts = async function () {
    // If lock expired, restart at 1
    if (this.lockUntil && this.lockUntil.getTime() < Date.now()) {
        this.failedLoginAttempts = 1;
        this.lockUntil = undefined;
        return this.updateOne({
            $set: { failedLoginAttempts: 1 },
            $unset: { lockUntil: 1 },
        });
    }
    this.failedLoginAttempts += 1;
    const updates = { $inc: { failedLoginAttempts: 1 } };
    if (this.failedLoginAttempts >= 5) {
        this.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        updates.$set = { lockUntil: this.lockUntil }; // 15 mins lock
    }
    return this.updateOne(updates);
};
userSchema.methods.resetLoginAttempts = async function () {
    return this.updateOne({
        $set: { failedLoginAttempts: 0 },
        $unset: { lockUntil: 1 },
    });
};
userSchema.virtual('is_active').get(function () {
    return this.active;
});
userSchema.virtual('roles').get(function () {
    return [this.role];
});
export default mongoose.model('user', userSchema);
