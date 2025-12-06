const serviceRequestService = require("../services/RequestService");

const createServiceRequest = async (req, res) => {
  try {
    const { serviceId, formData } = req.body;
    const userId = req.user.id;
    const request = await serviceRequestService.createServiceRequest({
      userId,
      serviceId,
      formData,
    });
    res.status(201).json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const getAllServiceRequests = async (req, res) => {
  try {
    const requests = await serviceRequestService.getAllServiceRequests(userId);
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const userId = req.user.id; // comes from JWT middleware
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

module.exports = {
  createServiceRequest,
  getAllServiceRequests,
  getMyRequests,
  getServiceRequestById,
  updateServiceRequest,
  deleteServiceRequest,
};
