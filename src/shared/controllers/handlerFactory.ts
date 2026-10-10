import asyncHandler from 'express-async-handler';

import AppError from '../utils/appError.js';
import APIFeatures from '../utils/ApiFeatures.js';
import { Model } from 'mongoose';


//----------------------------------------------------------------------------------------
export const getAll = (Model) => asyncHandler(async (req, res, next) => {
   let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };

const features = new APIFeatures(Model.find(), req.query)
  .filter()
  .sort()
  .limitFields()
  .paginate();

const docs = await features.query;

  res.status(200).json({
    status: 'success',
    results: docs.length,
    data: {
      docs,
    },
  });
});
  
//----------------------------------------------------------------------------------------
export const getOne = (Model,popOptions) => asyncHandler(async (req, res, next) => {
let Query = Model.findById(req.params.id);

 if (popOptions) Query = Query.populate(popOptions);

  const doc = await Query;

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { doc },
  });
});

//----------------------------------------------------------------------------------------
export const createOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

//----------------------------------------------------------------------------------------
export const updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

//----------------------------------------------------------------------------------------
export const deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError(`No ${Model} found with that ID`, 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
