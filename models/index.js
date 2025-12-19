const { Sequelize } = require("sequelize");
const sequelize = require("../db");

const User = require("./User");
const Service = require("./Service");
const ServiceRequest = require("./ServiceRequest");
const Certificate = require("./Certificate"); // 1️⃣ import certificate model

// User → ServiceRequest
User.hasMany(ServiceRequest, {
  foreignKey: "userId",
  as: "requests",
});

ServiceRequest.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// Service → ServiceRequest
Service.hasMany(ServiceRequest, {
  foreignKey: "serviceId",
  as: "requests",
});

ServiceRequest.belongsTo(Service, {
  foreignKey: "serviceId",
  as: "service",
});

// ServiceRequest → Certificate
ServiceRequest.hasOne(Certificate, {
  foreignKey: "requestId",
  as: "certificate",
  onDelete: "CASCADE",
});

Certificate.belongsTo(ServiceRequest, {
  foreignKey: "requestId",
  as: "request",
});

// Export sequelize and models
module.exports = {
  sequelize,
  User,
  Service,
  ServiceRequest,
  Certificate, // 2️⃣ export it
};
