const express = require("express");
const router = express.Router();
const {
  viewDocument,
  downloadDocument,
} = require("../controllers/documentController");
const authMiddleware = require("../middleware/authMiddleware");

// view document
router.get("/view/:filename", authMiddleware, viewDocument);

// download document
router.get("/download/:filename", authMiddleware, downloadDocument);

module.exports = router;
