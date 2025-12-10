const { User, ServiceRequest, Service } = require("../models");
const { fn, col } = require("sequelize");

exports.getSummaryReport = async (req, res) => {
  try {
    const totalResidents = await User.count({ where: { role: "resident" } });
    const approvedRequests = await ServiceRequest.count({
      where: { status: "approved" },
    });
    const pendingRequests = await ServiceRequest.count({
      where: { status: "pending" },
    });
    const certificatesIssued = await ServiceRequest.count({
      where: { status: "completed" },
    });

    res.json({
      totalResidents,
      approvedRequests,
      pendingRequests,
      certificatesIssued,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load summary report",
      error: error.message,
    });
  }
};

exports.getMonthlyReport = async (req, res) => {
  try {
    const totalCount = await ServiceRequest.count();
    if (totalCount === 0) return res.json([]);

    const monthly = await ServiceRequest.findAll({
      attributes: [
        [fn("DATE_TRUNC", "month", col("createdAt")), "month"],
        [fn("COUNT", "*"), "requests"],
      ],
      group: [fn("DATE_TRUNC", "month", col("createdAt"))],
      order: [[fn("DATE_TRUNC", "month", col("createdAt")), "ASC"]],
      raw: true,
    });

    const formatted = monthly.map((item) => ({
      month: new Date(item.month).toLocaleString("default", { month: "short" }),
      requests: parseInt(item.requests) || 0,
    }));

    res.json(formatted);
  } catch (error) {
    res.json([]);
  }
};

exports.getRecentRequests = async (req, res) => {
  try {
    const count = await ServiceRequest.count();
    if (count === 0) return res.json([]);

    const requests = await ServiceRequest.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
      include: [
        { model: User, as: "user", attributes: ["name"], required: false },
        {
          model: Service,
          as: "service",
          attributes: ["name"],
          required: false,
        },
      ],
    });

    const formattedRequests = requests.map((req) => ({
      id: req.id,
      status: req.status,
      createdAt: req.createdAt,
      user: req.user ? { name: req.user.name } : { name: "Unknown" },
      service: req.service
        ? { name: req.service.name }
        : { name: "Unknown Service" },
    }));

    res.json(formattedRequests);
  } catch (error) {
    res.json([]);
  }
};
