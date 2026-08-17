const Service = require('../models/Service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Get all service categories with optional filtering
exports.getAllServices = catchAsync(async (req, res, next) => {
  const { search = '', status = 'all', sort = 'name' } = req.query;

  let query = {};

  // If request is from customer/public (not admin), only return active categories
  if (!req.user || req.user.role !== 'admin') {
    query.isActive = true;
  } else if (status === 'active') {
    query.isActive = true;
  } else if (status === 'inactive') {
    query.isActive = false;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  let sortOptions = { name: 1 };
  if (sort === 'price_asc') sortOptions = { basePrice: 1 };
  if (sort === 'price_desc') sortOptions = { basePrice: -1 };
  if (sort === 'newest') sortOptions = { createdAt: -1 };

  const services = await Service.find(query).sort(sortOptions);

  res.status(200).json({
    status: 'success',
    results: services.length,
    data: {
      services
    }
  });
});

// Get single service category by ID
exports.getService = catchAsync(async (req, res, next) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return next(new AppError('Service category not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      service
    }
  });
});

// Create a new service category
exports.createService = catchAsync(async (req, res, next) => {
  const { name, description, icon, basePrice, subServices, isActive } = req.body;

  const existing = await Service.findOne({ name: { $regex: `^${name.trim()}$`, $options: 'i' } });
  if (existing) {
    return next(new AppError('A service category with this name already exists.', 400));
  }

  const newService = await Service.create({
    name,
    description,
    icon: icon || 'Wrench',
    basePrice: Number(basePrice),
    isActive: isActive !== undefined ? isActive : true,
    subServices: subServices || []
  });

  res.status(201).json({
    status: 'success',
    message: 'Service category created successfully',
    data: {
      service: newService
    }
  });
});

// Update an existing service category
exports.updateService = catchAsync(async (req, res, next) => {
  const { name, description, icon, basePrice, isActive } = req.body;

  const service = await Service.findById(req.params.id);
  if (!service) {
    return next(new AppError('Service category not found', 404));
  }

  if (name && name !== service.name) {
    const existing = await Service.findOne({ name: { $regex: `^${name.trim()}$`, $options: 'i' } });
    if (existing && existing._id.toString() !== req.params.id) {
      return next(new AppError('Another service category with this name already exists.', 400));
    }
    service.name = name;
  }

  if (description !== undefined) service.description = description;
  if (icon !== undefined) service.icon = icon;
  if (basePrice !== undefined) service.basePrice = Number(basePrice);
  if (isActive !== undefined) service.isActive = isActive;

  await service.save();

  res.status(200).json({
    status: 'success',
    message: 'Service category updated successfully',
    data: {
      service
    }
  });
});

// Toggle category active/inactive status
exports.toggleServiceStatus = catchAsync(async (req, res, next) => {
  const service = await Service.findById(req.params.id);
  if (!service) {
    return next(new AppError('Service category not found', 404));
  }

  service.isActive = !service.isActive;
  await service.save();

  res.status(200).json({
    status: 'success',
    message: `Service category is now ${service.isActive ? 'active' : 'disabled'}`,
    data: {
      service
    }
  });
});

// Delete a service category
exports.deleteService = catchAsync(async (req, res, next) => {
  const deletedService = await Service.findByIdAndDelete(req.params.id);

  if (!deletedService) {
    return next(new AppError('Service category not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Service category deleted successfully',
    data: null
  });
});

// Add sub-service to a category
exports.addSubService = catchAsync(async (req, res, next) => {
  const { name, price, description, isActive } = req.body;

  if (!name || price === undefined) {
    return next(new AppError('Please provide sub-service name and price.', 400));
  }

  const service = await Service.findById(req.params.id);
  if (!service) {
    return next(new AppError('Service category not found', 404));
  }

  service.subServices.push({
    name,
    price: Number(price),
    description: description || '',
    isActive: isActive !== undefined ? isActive : true
  });

  await service.save();

  res.status(201).json({
    status: 'success',
    message: 'Sub-service added successfully',
    data: {
      service
    }
  });
});

// Update a sub-service in a category
exports.updateSubService = catchAsync(async (req, res, next) => {
  const { name, price, description, isActive } = req.body;
  const { id, subId } = req.params;

  const service = await Service.findById(id);
  if (!service) {
    return next(new AppError('Service category not found', 404));
  }

  const sub = service.subServices.id(subId);
  if (!sub) {
    return next(new AppError('Sub-service not found', 404));
  }

  if (name !== undefined) sub.name = name;
  if (price !== undefined) sub.price = Number(price);
  if (description !== undefined) sub.description = description;
  if (isActive !== undefined) sub.isActive = isActive;

  await service.save();

  res.status(200).json({
    status: 'success',
    message: 'Sub-service updated successfully',
    data: {
      service
    }
  });
});

// Toggle sub-service active/inactive status
exports.toggleSubServiceStatus = catchAsync(async (req, res, next) => {
  const { id, subId } = req.params;

  const service = await Service.findById(id);
  if (!service) {
    return next(new AppError('Service category not found', 404));
  }

  const sub = service.subServices.id(subId);
  if (!sub) {
    return next(new AppError('Sub-service not found', 404));
  }

  sub.isActive = !sub.isActive;
  await service.save();

  res.status(200).json({
    status: 'success',
    message: `Sub-service is now ${sub.isActive ? 'active' : 'disabled'}`,
    data: {
      service
    }
  });
});

// Delete a sub-service from a category
exports.deleteSubService = catchAsync(async (req, res, next) => {
  const { id, subId } = req.params;

  const service = await Service.findById(id);
  if (!service) {
    return next(new AppError('Service category not found', 404));
  }

  const subIndex = service.subServices.findIndex((s) => s._id.toString() === subId);
  if (subIndex === -1) {
    return next(new AppError('Sub-service not found', 404));
  }

  service.subServices.splice(subIndex, 1);
  await service.save();

  res.status(200).json({
    status: 'success',
    message: 'Sub-service deleted successfully',
    data: {
      service
    }
  });
});

// Provider Service Management Functions
exports.getMyServices = catchAsync(async (req, res, next) => {
  const { search = '', status = 'all' } = req.query;
  let query = { provider: req.user._id };

  if (status === 'active') query.isActive = true;
  if (status === 'inactive') query.isActive = false;

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } }
    ];
  }

  const services = await Service.find(query).sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: services.length,
    data: {
      services
    }
  });
});

exports.createProviderService = catchAsync(async (req, res, next) => {
  const { name, category, description, basePrice, icon, image, subServices } = req.body;

  if (!name || !name.trim()) {
    return next(new AppError('Please provide a valid service name.', 400));
  }
  if (!category || !category.trim()) {
    return next(new AppError('Please select a service category.', 400));
  }
  if (!description || !description.trim()) {
    return next(new AppError('Please provide a service description.', 400));
  }
  const priceNum = Number(basePrice);
  if (isNaN(priceNum) || priceNum <= 0) {
    return next(new AppError('Price must be a positive number greater than 0.', 400));
  }
  if (priceNum > 1000000) {
    return next(new AppError('Price exceeds maximum allowed limit (₹1,000,000).', 400));
  }

  const existing = await Service.findOne({
    provider: req.user._id,
    name: { $regex: `^${name.trim()}$`, $options: 'i' }
  });
  if (existing) {
    return next(new AppError('You have already created a service with this name.', 400));
  }

  const newService = await Service.create({
    name: name.trim(),
    category: category.trim(),
    description: description.trim(),
    basePrice: priceNum,
    provider: req.user._id,
    icon: icon || 'Wrench',
    image: image || '',
    isActive: true,
    subServices: subServices || []
  });

  res.status(201).json({
    status: 'success',
    message: 'Service created successfully and is now active for customers.',
    data: {
      service: newService
    }
  });
});

exports.updateProviderService = catchAsync(async (req, res, next) => {
  const { name, category, description, basePrice, icon, image, isActive, subServices } = req.body;

  const service = await Service.findById(req.params.id);
  if (!service) {
    return next(new AppError('Service not found', 404));
  }

  if (service.provider && service.provider.toString() !== req.user.id) {
    return next(new AppError('You are not authorized to edit another provider\'s service.', 403));
  }

  if (name !== undefined) {
    if (!name.trim()) return next(new AppError('Service name cannot be empty.', 400));
    service.name = name.trim();
  }
  if (category !== undefined) {
    if (!category.trim()) return next(new AppError('Category cannot be empty.', 400));
    service.category = category.trim();
  }
  if (description !== undefined) {
    if (!description.trim()) return next(new AppError('Description cannot be empty.', 400));
    service.description = description.trim();
  }
  if (basePrice !== undefined) {
    const priceNum = Number(basePrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      return next(new AppError('Price must be a positive number greater than 0.', 400));
    }
    if (priceNum > 1000000) {
      return next(new AppError('Price exceeds maximum allowed limit (₹1,000,000).', 400));
    }
    service.basePrice = priceNum;
  }
  if (icon !== undefined) service.icon = icon;
  if (image !== undefined) service.image = image;
  if (isActive !== undefined) service.isActive = isActive;
  if (subServices !== undefined) service.subServices = subServices;

  await service.save();

  res.status(200).json({
    status: 'success',
    message: 'Service updated successfully',
    data: {
      service
    }
  });
});

exports.toggleProviderServiceStatus = catchAsync(async (req, res, next) => {
  const service = await Service.findById(req.params.id);
  if (!service) {
    return next(new AppError('Service not found', 404));
  }

  if (service.provider && service.provider.toString() !== req.user.id) {
    return next(new AppError('You are not authorized to modify another provider\'s service status.', 403));
  }

  service.isActive = !service.isActive;
  await service.save();

  res.status(200).json({
    status: 'success',
    message: `Service status is now ${service.isActive ? 'Active' : 'Inactive'}`,
    data: {
      service
    }
  });
});

exports.deleteProviderService = catchAsync(async (req, res, next) => {
  const service = await Service.findById(req.params.id);
  if (!service) {
    return next(new AppError('Service not found', 404));
  }

  if (service.provider && service.provider.toString() !== req.user.id) {
    return next(new AppError('You are not authorized to delete another provider\'s service.', 403));
  }

  const Booking = require('../models/Booking');
  const existingBookingsCount = await Booking.countDocuments({ service: service._id });

  if (existingBookingsCount > 0) {
    service.isActive = false;
    await service.save();
    return res.status(200).json({
      status: 'success',
      message: `Service has ${existingBookingsCount} existing booking records. Deactivated service to preserve historical data.`,
      data: {
        service,
        archived: true
      }
    });
  }

  await Service.findByIdAndDelete(service._id);

  res.status(200).json({
    status: 'success',
    message: 'Service deleted successfully',
    data: null
  });
});
