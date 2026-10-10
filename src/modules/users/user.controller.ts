import asyncHandler from 'express-async-handler';
import multer from 'multer';
import sharp from 'sharp';
import mongoose from 'mongoose';


import User from './user.model.js';
import AppError from '../../shared/utils/appError.js';
import { createOne, deleteOne, getOne, updateOne } from '../../shared/controllers/handlerFactory.js';

//-------------------------------------------------------------------------------------------

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError('Not an image..! , Please upload Only image .', 400),
      false
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
export const uploadUserPhoto = upload.single('photo');

export const resizeUserPhoto = async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};

//-------------------------------------------------------------------------------------------
export const createUser = createOne(User);

//-------------------------------------------------------------------------------------------
const filterObj = (Obj, ...allowedFields) => {
  const newObj = {};

  Object.keys(Obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = Obj[el];
  });
  return newObj;
};

//----------------------------------------------------------------------------------------
export const getUsers = asyncHandler(async (req, res, next) => {
  const Users = await User.find({});

  res.status(200).json({
    status: 'success',
    results: Users.length,
    data: {
      Users,
    },
  });
});

//----------------------------------------------------------------------------------------
export const getUserById = getOne(User, undefined);

//----------------------------------------------------------------------------------------
export const getMe = asyncHandler(async (req, res, next) => {
  req.params.id = req.user.id;
  next();
});
//----------------------------------------------------------------------------------------
export const updateMe = asyncHandler(async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return next(new AppError('User not authenticated', 401));
  }

  if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
    return next(new AppError('Invalid user ID', 400));
  }

  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  const filteredBody: any = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  const updateuser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  if (!updateuser) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: updateuser,
    },
  });
});

//----------------------------------------------------------------------------------------
export const deleteMe = asyncHandler(async (req, res, next) => {
  // ✅ تحقق من وجود req.user
  if (!req.user || !req.user.id) {
    return next(new AppError('User not authenticated', 401));
  }

  // ✅ تحقق من صحة الـ ID
  if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
    return next(new AppError('Invalid user ID', 400));
  }

  const user = await User.findByIdAndUpdate(req.user.id, { active: false });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

//----------------------------------------------------------------------------------------
export const updateUser = updateOne(User);

//----------------------------------------------------------------------------------------
export const deleteUser = deleteOne(User);
