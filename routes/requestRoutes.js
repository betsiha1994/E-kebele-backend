const express = require("express");
const router = express.Router();
const serviceRequestController = require("../controllers/RequestController");
const authenticate = require("../middleware/authMiddleware");

// Create a new service request
router.post("/", authenticate, serviceRequestController.createServiceRequest);

// Get all service requests
router.get("/", serviceRequestController.getAllServiceRequests);
router.get(
  "/my-requests",
  authenticate,
  serviceRequestController.getMyRequests
);

router.get("/:id", serviceRequestController.getServiceRequestById);

router.put("/:id", serviceRequestController.updateServiceRequest);

// Delete a service request by ID
router.delete("/:id", serviceRequestController.deleteServiceRequest);

module.exports = router;
