const express = require("express");
const router = express.Router();
const serviceRequestController = require("../controllers/RequestController");
const authenticate = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

router.post(
  "/",
  authenticate,
  upload.any(), // 'document' is the input name from frontend
  serviceRequestController.createServiceRequest
);

router.get("/", serviceRequestController.getAllServiceRequests);
router.get(
  "/my-requests",
  authenticate,
  serviceRequestController.getMyRequests
);

router.get("/:id", serviceRequestController.getServiceRequestById);

router.put("/:id", serviceRequestController.updateServiceRequest);

router.delete("/:id", serviceRequestController.deleteServiceRequest);
router.put("/:id/approve", serviceRequestController.approveRequest);
router.put("/:id/reject", serviceRequestController.rejectRequest);

module.exports = router;
