const express = require("express");
const controller = require("../controllers/serviceController");
const multer = require("multer");
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });


router.get("/", controller.getAllServices);
router.get("/:id", controller.getServiceById);


router.post("/", upload.single("image"), controller.createService);

// PUT service with optional image update
router.put("/:id", upload.single("image"), controller.updateService);

router.delete("/:id", controller.deleteService);

module.exports = router;
