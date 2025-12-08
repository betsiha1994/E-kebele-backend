const { User, Service, ServiceRequest } = require("../models");

// Dashboard controller with service logic included
const getDashboardStats = async (req, res) => {
  try {
    // Service logic directly in controller
    const users = await User.count();
    const services = await Service.count();
    const requests = await ServiceRequest.count();
    const completed = await ServiceRequest.count({
      where: { status: "approved" },
    });

    // Send response
    res.json({
      users,
      services,
      requests,
      completed,
    });
  } catch (err) {
    console.error("Dashboard Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
const getDashboardCharts = async (req, res) => {
  try {
    // Requests Over Time (last 7 days)
    const requestsOverTimeRaw = await ServiceRequest.findAll({
      attributes: [
        [sequelize.fn("DATE", col("createdAt")), "date"],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal("CASE WHEN status='approved' THEN 1 ELSE 0 END")
          ),
          "approved",
        ],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal("CASE WHEN status='pending' THEN 1 ELSE 0 END")
          ),
          "pending",
        ],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal("CASE WHEN status='rejected' THEN 1 ELSE 0 END")
          ),
          "rejected",
        ],
      ],
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date() - 7 * 24 * 60 * 60 * 1000), // last 7 days
        },
      },
      group: ["date"],
      order: [["date", "ASC"]],
      raw: true,
    });

    const requestsOverTime = requestsOverTimeRaw.map((item) => ({
      date: item.date,
      approved: parseInt(item.approved, 10),
      pending: parseInt(item.pending, 10),
      rejected: parseInt(item.rejected, 10),
    }));

    // Service Completion Rate
    const approved = await ServiceRequest.count({
      where: { status: "approved" },
    });
    const pending = await ServiceRequest.count({
      where: { status: "pending" },
    });
    const rejected = await ServiceRequest.count({
      where: { status: "rejected" },
    });

    res.json({
      requestsOverTime,
      completionRate: [
        { name: "Approved", value: approved },
        { name: "Pending", value: pending },
        { name: "Rejected", value: rejected },
      ],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getDashboardStats,
  getDashboardCharts,
};
