// const ServiceRequest = require("../models/ServiceRequest");
// const Service = require("../models/Service");
// const User = require("../models/User");
const { ServiceRequest, Service, User } = require("../models");

const createServiceRequest = async ({
  userId,
  serviceId,
  formData,
  document,
}) => {
  const serviceRequest = await ServiceRequest.create({
    userId,
    serviceId,
    formData,
    document: document || null, // ✅ add this line
    status: "pending",
  });
  return serviceRequest;
};

const getAllServiceRequests = async () => {
  return await ServiceRequest.findAll({
    include: [
      { model: User, as: "user", attributes: ["id", "name", "email"] },
      { model: Service, as: "service", attributes: ["id", "name", "slug"] },
    ],
    order: [["createdAt", "DESC"]],
  });
};

const getRequestsByUser = async (userId) => {
  const requests = await ServiceRequest.findAll({
    where: { userId },
    include: [{ model: Service, attributes: ["id", "name", "slug"] }],
    order: [["createdAt", "DESC"]],
  });
  return requests;
};
const getServiceRequestById = async (id) => {
  const request = await ServiceRequest.findByPk(id, {
    include: [
      { model: User, attributes: ["id", "name", "email"] },
      { model: Service, attributes: ["id", "name", "slug"] },
    ],
  });
  return request;
};

const updateServiceRequest = async (id, updateData) => {
  const request = await getServiceRequestById(id);
  if (!request) throw new Error("Service request not found");

  await request.update(updateData);
  return request;
};

const deleteServiceRequest = async (id) => {
  const request = await getServiceRequestById(id);
  if (!request) throw new Error("Service request not found");

  await request.destroy();
  return true;
};

module.exports = {
  createServiceRequest,
  getAllServiceRequests,
  getRequestsByUser,
  getServiceRequestById,
  updateServiceRequest,
  deleteServiceRequest,
};
