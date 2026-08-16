const Service = require('../models/Service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getAllServices = catchAsync(async (req, res, next) => {
  const services = await Service.find();
  res.status(200).json({
    status: 'success',
    results: services.length,
    data: {
      services
    }
  });
});

exports.createService = catchAsync(async (req, res, next) => {
  const { name, description, icon, basePrice, subServices } = req.body;

  const newService = await Service.create({
    name,
    description,
    icon,
    basePrice,
    subServices
  });

  res.status(201).json({
    status: 'success',
    data: {
      service: newService
    }
  });
});

exports.updateService = catchAsync(async (req, res, next) => {
  const updatedService = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!updatedService) {
    return next(new AppError('Service category not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      service: updatedService
    }
  });
});

exports.deleteService = catchAsync(async (req, res, next) => {
  const deletedService = await Service.findByIdAndDelete(req.params.id);

  if (!deletedService) {
    return next(new AppError('Service category not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
