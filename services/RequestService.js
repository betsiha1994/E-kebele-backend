const ServiceRequest = require("../models/ServiceRequest");
const Service = require("../models/Service");
const User = require("../models/User");

const createServiceRequest = async ({ userId, serviceId, formData }) => {
  const serviceRequest = await ServiceRequest.create({
    userId,
    serviceId,
    formData,
    status: "pending", // default status
  });
  return serviceRequest;
};

const getAllServiceRequests = async (req, res) => {
  try {
    // admin sees all requests

    const requests = await ServiceRequest.findAll({
      include: [
        { model: User, attributes: ["id", "name", "email"] },
        { model: Service, attributes: ["id", "name", "slug"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
