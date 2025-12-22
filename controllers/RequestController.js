const serviceRequestService = require("../services/RequestService");
const {
  notifyRequestApproved,
  notifyRequestRejected,
} = require("../utils/notificationService");
const { User, ServiceRequest, Certificate, Service } = require("../models");

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
      include: [{ model: User }, { model: Service }],
    });

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // 🔐 Always use Sequelize aliases correctly
    const user = request.User;
    const service = request.Service;

    if (!user || !service) {
      return res.status(500).json({
        error: "User or Service data missing",
      });
    }

    // ✅ Approve request
    request.status = "approved";
    request.approvedAt = new Date();
    await request.save();

    console.log(`[DEBUG] Request approved, generating certificate...`);

    // 🧠 Dynamic certificate data
    const cert = await generateCertificate({
      name: user.fullName || user.name,
      kebele: user.kebele || user.address || "",
      certificateTitle: service.name, // 🔥 Dynamic title
      extraData: request.formData || {}, // 🔥 Dynamic fields
    });

    console.log(`[DEBUG] Certificate generated:`, cert);

    // 💾 Save certificate record
    const certificateRecord = await Certificate.create({
      requestId: request.id,
      userId: user.id,
      filename: cert.filename,
      filePath: cert.filePath,
      issuedAt: cert.dateIssued,
      certificateId: cert.filename.replace(".pdf", "").split("_").pop(),
      status: "issued",
    });

    // 🔗 Link certificate to request
    request.certificateId = certificateRecord.id;
    request.status = "completed";
    await request.save();

    // 📢 Notify user
    await notifyRequestApproved(user, {
      certificateId: certificateRecord.id,
      downloadUrl: cert.downloadUrl,
      issuedDate: cert.dateIssued,
    });

    return res.json({
      message: "Request approved and certificate generated",
      certificate: {
        id: certificateRecord.id,
        filename: cert.filename,
        downloadUrl: cert.downloadUrl,
        issuedAt: cert.dateIssued,
        title: service.name,
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
    return res.status(500).json({
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
