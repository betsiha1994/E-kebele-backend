const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware"); 
// const adminOnly = require("../middlewares/adminOnly"); // optional: admin-only


router.get(
  "/dashboard",
  //   authMiddleware,
  // adminOnly,
  dashboardController.getDashboardStats
);
router.get(
  "/dashboard/charts",
  //   authMiddleware,
  // adminOnly,
  dashboardController.getDashboardCharts
);

module.exports = router;
