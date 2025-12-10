const { User, ServiceRequest, Service } = require("../models");
const { Op, fn, col, literal } = require("sequelize");

exports.getSummaryReport = async (req, res) => {
  console.log("🔍 getSummaryReport called");

  try {
    console.log("1. Counting residents...");
    const totalResidents = await User.count({
      where: { role: "resident" },
    }).catch((err) => {
      console.error("❌ Error counting residents:", err.message);
      return 0;
    });

    console.log("2. Counting approved requests...");
    const approvedRequests = await ServiceRequest.count({
      where: { status: "approved" },
    }).catch((err) => {
      console.error("❌ Error counting approved requests:", err.message);
      return 0;
    });

    console.log("3. Counting pending requests...");
    const pendingRequests = await ServiceRequest.count({
      where: { status: "pending" },
    }).catch((err) => {
      console.error("❌ Error counting pending requests:", err.message);
      return 0;
    });

    console.log("4. Counting completed requests...");
    const certificatesIssued = await ServiceRequest.count({
      where: { status: "completed" },
    }).catch((err) => {
      console.error("❌ Error counting completed requests:", err.message);
      return 0;
    });

    console.log("✅ Results:", {
      totalResidents,
      approvedRequests,
      pendingRequests,
      certificatesIssued,
    });

    res.json({
      totalResidents,
      approvedRequests,
      pendingRequests,
      certificatesIssued,
    });
  } catch (error) {
    console.error("🔥 getSummaryReport CATCH ERROR:");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    console.error("Full error:", JSON.stringify(error, null, 2));

    // Check if it's a Sequelize error
    if (error.name) console.error("Error name:", error.name);
    if (error.parent) console.error("Parent error:", error.parent.message);

    res.status(500).json({
      message: "Failed to load summary report",
      error: error.message,
    });
  }
};

/**
 * ✅ MONTHLY REPORT (Simplified)
 */
exports.getMonthlyReport = async (req, res) => {
  console.log("🔍 getMonthlyReport called");

  try {
    // First, let's try a simpler query
    console.log("1. Trying simple count first...");
    const totalCount = await ServiceRequest.count();
    console.log("Total service requests in DB:", totalCount);

    // If no data, return empty array
    if (totalCount === 0) {
      console.log("No data found, returning empty array");
      return res.json([]);
    }

    // Try a simpler monthly query
    console.log("2. Trying monthly aggregation...");
    const monthly = await ServiceRequest.findAll({
      attributes: [
        [fn("DATE_TRUNC", "month", col("createdAt")), "month"],
        [fn("COUNT", "*"), "requests"],
      ],
      group: [fn("DATE_TRUNC", "month", col("createdAt"))],
      order: [[fn("DATE_TRUNC", "month", col("createdAt")), "ASC"]],
      raw: true,
    }).catch((err) => {
      console.error("❌ Monthly query failed:", err.message);
      return [];
    });

    console.log("✅ Monthly data:", monthly);

    // Format the response
    const formatted = monthly.map((item) => ({
      month: new Date(item.month).toLocaleString("default", { month: "short" }),
      requests: parseInt(item.requests) || 0,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("🔥 getMonthlyReport ERROR:", error.message);
    console.error("Stack:", error.stack);

    // Return empty array as fallback
    res.json([]);
  }
};

/**
 * ✅ RECENT REQUESTS
 */
exports.getRecentRequests = async (req, res) => {
  console.log("🔍 getRecentRequests called");

  try {
    console.log("1. Checking ServiceRequest model...");
    const count = await ServiceRequest.count();
    console.log("Total ServiceRequest records:", count);

    if (count === 0) {
      console.log("No requests found, returning empty array");
      return res.json([]);
    }

    console.log("2. Fetching recent requests with associations...");
    const requests = await ServiceRequest.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name"],
          required: false, // LEFT JOIN instead of INNER JOIN
        },
        {
          model: Service,
          as: "service",
          attributes: ["name"],
          required: false,
        },
      ],
    }).catch((err) => {
      console.error("❌ Error fetching recent requests:", err.message);
      if (err.name === "SequelizeEagerLoadingError") {
        console.error("Eager loading error - trying without associations...");
        return ServiceRequest.findAll({
          limit: 5,
          order: [["createdAt", "DESC"]],
          raw: true,
        });
      }
      throw err;
    });

    console.log("✅ Found", requests.length, "recent requests");

    // Format response to match frontend expectations
    const formattedRequests = requests.map((req) => {
      if (req.dataValues) {
        // Sequelize instance
        return {
          id: req.id,
          status: req.status,
          createdAt: req.createdAt,
          user: req.user ? { name: req.user.name } : { name: "Unknown" },
          service: req.service
            ? { name: req.service.name }
            : { name: "Unknown Service" },
        };
      } else {
        // Raw object (from fallback)
        return {
          id: req.id,
          status: req.status,
          createdAt: req.createdAt,
          user: { name: "Unknown" },
          service: { name: "Unknown Service" },
        };
      }
    });

    res.json(formattedRequests);
  } catch (error) {
    console.error("🔥 getRecentRequests ERROR:", error.message);
    console.error("Stack:", error.stack);

    // Return empty array instead of 500 error
    res.json([]);
  }
};
