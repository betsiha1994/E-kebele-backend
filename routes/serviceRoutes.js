const express = require("express");
const controller = require("../controllers/serviceController");
const multer = require("multer");
const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"), // uploads folder in project root
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// Routes
router.get("/", controller.getAllServices);
router.get("/:id", controller.getServiceById);

// POST service with image upload
router.post("/", upload.single("image"), controller.createService);

// PUT service with optional image update
router.put("/:id", upload.single("image"), controller.updateService);

router.delete("/:id", controller.deleteService);

module.exports = router;
