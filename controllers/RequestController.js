const serviceRequestService = require("../services/RequestService");
const {
  notifyRequestApproved,
  notifyRequestRejected,
} = require("../utils/notificationService");
const { User, ServiceRequest } = require("../models");
const upload = require("../middleware/upload");

const createServiceRequest = async (req, res) => {
  try {
    const { serviceId } = req.body;
    const userId = req.user.id;

    const data = {
      userId,
      serviceId,
      formData: req.body, // keep all dynamic fields
    };

    // ✅ FIX: read from req.files
    if (req.files && req.files.length > 0) {
      data.document = req.files[0].filename; // first uploaded file
    }

    const request = await serviceRequestService.createServiceRequest(data);

    res.status(201).json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const getAllServiceRequests = async (req, res) => {
  try {
    const requests = await serviceRequestService.getAllServiceRequests();
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await serviceRequestService.getRequestsByUser(userId);

    res.status(200).json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
const getServiceRequestById = async (req, res) => {
  try {
    const request = await serviceRequestService.getServiceRequestById(
      req.params.id
    );
    if (!request) return res.status(404).json({ error: "Request not found" });
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateServiceRequest = async (req, res) => {
  try {
    const updatedRequest = await serviceRequestService.updateServiceRequest(
      req.params.id,
      req.body
    );
    res.json(updatedRequest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteServiceRequest = async (req, res) => {
  try {
    await serviceRequestService.deleteServiceRequest(req.params.id);
    res.json({ message: "Service request deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const approveRequest = async (req, res) => {
  const request = await ServiceRequest.findByPk(req.params.id, {
    include: User,
  });
  if (!request) return res.status(404).json({ error: "Request not found" });

  request.status = "approved";
  await request.save();

  await notifyRequestApproved(request.user);

  res.json({ message: "Request approved and notification sent" });
};
const rejectRequest = async (req, res) => {
  const { reason } = req.body;
  const request = await ServiceRequest.findByPk(req.params.id, {
    include: User,
  });
  if (!request) return res.status(404).json({ error: "Request not found" });

  request.status = "rejected";
  await request.save();

  await notifyRequestRejected(request.user, reason);

  res.json({ message: "Request rejected and notification sent" });
};

module.exports = {
  createServiceRequest,
  getAllServiceRequests,
  getMyRequests,
  getServiceRequestById,
  updateServiceRequest,
  deleteServiceRequest,
  approveRequest,
  rejectRequest,
};
