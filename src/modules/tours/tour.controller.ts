import asyncHandler from 'express-async-handler';
import multer from 'multer';

import Tour from './tour.model.js';
import AppError from '../../shared/utils/appError.js';
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from '../../shared/controllers/handlerFactory.js';
import sharp from 'sharp';

//----------------------------------------------------------------------------------------

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

export const uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

export const resizeTourImages = async (req, res, next) => {
  try {

    if (!req.files || (!req.files.imageCover && !req.files.images)) {
      return next();
    }


    if (req.files.imageCover) {
      const coverFilename = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

      await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${coverFilename}`);


      req.body.imageCover = coverFilename;
    }

     if (req.files.images && req.files.images.length > 0) {
      req.body.images = [];

      // نستخدم Promise.all للتوازي (أسرع)
      await Promise.all(
        req.files.images.map(async (file, index) => {
          const filename = `tour-${req.params.id}-${Date.now()}-${index + 1}.jpeg`;

          await sharp(file.buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/tours/${filename}`);

          req.body.images.push(filename);
        })
      );
    }

    next();
  } catch (err) {
    // لو حصل أي خطأ أثناء الـ resize (مثلاً مشكلة في sharp أو في الكتابة)
    return next(new AppError('Error processing tour images', 500));
  }
};

//----------------------------------------------------------------------------------------
export const getDistances = asyncHandler(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  if (1 === 1) {
  }
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400
      )
    );
  }
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    { $project: { distance: 1, name: 1 } },
  ]);

  res.status(200).json({
    status: 'success',
    results: distances.length,
    data: {
      data: distances,
    },
  });
});

//----------------------------------------------------------------------------------------
export const getToursWithin = asyncHandler(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

//----------------------------------------------------------------------------------------
export const createTour = createOne(Tour);

//-------------------------------------------------------------------------------------------
export const getTour = getAll(Tour);

//----------------------------------------------------------------------------------------
export const getTourById = getOne(Tour, {
  path: 'reviews',
  select: '-__v -createdAt -updatedAt',
});

//----------------------------------------------------------------------------------------
export const updateTour = updateOne(Tour);

//----------------------------------------------------------------------------------------
export const deleteTour = deleteOne(Tour);
