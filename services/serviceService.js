const Service = require("../models/Service");

// Create a new service
const createService = async (data) => {
  return await Service.create(data);
};

// Get all services
const getAllServices = async () => {
  return await Service.findAll();
};

// Get a service by ID
const getServiceById = async (id) => {
  return await Service.findByPk(id);
};

// Update a service
const updateService = async (id, data) => {
  const service = await Service.findByPk(id);
  if (!service) throw new Error("Service not found");
  return await service.update(data);
};

// Delete a service
const deleteService = async (id) => {
  const service = await Service.findByPk(id);
  if (!service) throw new Error("Service not found");
  await service.destroy();
  return { message: "Service deleted successfully" };
};

module.exports = {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
};
