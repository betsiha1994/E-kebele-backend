const { Sequelize } = require("sequelize");
const sequelize = require("../db");

const User = require("./User");
const Service = require("./Service");
const ServiceRequest = require("./ServiceRequest");

// Set up associations
User.hasMany(ServiceRequest, {
  foreignKey: "userId",
  as: "requests",
});

ServiceRequest.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Service.hasMany(ServiceRequest, {
  foreignKey: "serviceId",
  as: "requests",
});

ServiceRequest.belongsTo(Service, {
  foreignKey: "serviceId",
  as: "service",
});

// Export sequelize and models
module.exports = {
  sequelize,
  User,
  Service,
  ServiceRequest,
};
