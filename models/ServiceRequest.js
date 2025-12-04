const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const Service = require("./Service");
const User = require("./User");

const ServiceRequest = sequelize.define(
  "ServiceRequest",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    serviceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected", "closed"),
      defaultValue: "pending",
    },
    // Stores the submitted form data if service has dynamic fields
    formData: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    adminNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "service_requests",
    timestamps: true,
  }
);

// Associations
ServiceRequest.belongsTo(User, { foreignKey: "userId" });
ServiceRequest.belongsTo(Service, { foreignKey: "serviceId" });
Service.hasMany(ServiceRequest, { foreignKey: "serviceId" });
User.hasMany(ServiceRequest, { foreignKey: "userId" });

module.exports = ServiceRequest;
