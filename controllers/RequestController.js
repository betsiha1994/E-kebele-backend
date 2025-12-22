const serviceRequestService = require("../services/RequestService");
const {
  notifyRequestApproved,
  notifyRequestRejected,
} = require("../utils/notificationService");
const { User, ServiceRequest, Certificate } = require("../models");

const upload = require("../middleware/upload");
const generateCertificate = require("../utils/generateCertificate");

const createServiceRequest = async (req, res) => {
  try {
    const { serviceId } = req.body;
    const userId = req.user.id;

    const data = {
      userId,
      serviceId,
      formData: req.body,
    };

    if (req.files && req.files.length > 0) {
      data.document = req.files[0].filename;
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
  console.log(`[DEBUG] Starting approval for request ID: ${req.params.id}`);
  try {
    const request = await ServiceRequest.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "user",
        },
      ],
    });

    console.log(`[DEBUG] Request found:`, {
      id: request?.id,
      status: request?.status,
    });
    console.log("---- DEBUG DB RESPONSE ----");
    console.log("request.userId =", request.userId);
    console.log("request.user =", request.user);

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    request.status = "approved";
    request.approvedAt = new Date(); // Store approval timestamp
    console.log(`[DEBUG] Before save - status: ${request.status}`);
    await request.save();
    console.log(`[DEBUG] Request saved successfully`);

    console.log(`[DEBUG] Starting certificate generation...`);
    const cert = await generateCertificate({
      name: request?.user?.name ?? "Unknown",
      kebele: request?.user?.kebele ?? request?.kebele ?? "",
    });
    console.log(`[DEBUG] Certificate generated:`, cert);

    // Save certificate record in DB
    const certificateRecord = await Certificate.create({
      requestId: request.id,
      userId: request.user.id,
      filename: cert.filename,
      filePath: cert.filePath,
      issuedAt: cert.dateIssued, // This comes from generateCertificate's return
      certificateId: cert.filename.replace(".pdf", "").split("_").pop(),
      status: "issued",
    });
    if (!request.user) {
      console.log("[ERROR] request.user is undefined!");
      return res.status(500).json({
        error: "User data missing. Cannot generate certificate.",
      });
    }
    // Update request with certificate reference
    request.certificateId = certificateRecord.id;
    await request.save();

    // Send notification (email/SMS)
    await notifyRequestApproved(request.user, {
      certificateId: certificateRecord.id,
      downloadUrl: `/certificates/${cert.filename}`,
      issuedDate: cert.dateIssued,
    });

    return res.json({
      message: "Request approved and certificate generated",
      certificate: {
        id: certificateRecord.id,
        filename: cert.filename,
        downloadUrl: `/certificates/${cert.filename}`,
        issuedAt: cert.dateIssued,
        status: "issued",
      },
      request: {
        id: request.id,
        status: request.status,
        approvedAt: request.approvedAt,
      },
    });
  } catch (err) {
    console.error("Approve request error:", err);
    res.status(500).json({
      error: "Failed to approve request",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
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
