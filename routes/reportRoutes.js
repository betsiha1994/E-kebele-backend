const express = require("express");
const router = express.Router();

const {
  getSummaryReport,
  getMonthlyReport,
  getRecentRequests,
} = require("../controllers/reportController");

const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

router.get("/summary", getSummaryReport);
router.get("/monthly", getMonthlyReport);
router.get("/recent", getRecentRequests);

module.exports = router;
