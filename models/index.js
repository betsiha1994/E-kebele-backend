const { Sequelize } = require("sequelize");
const sequelize = require("../db");

const User = require("./User");
const Service = require("./Service");
const ServiceRequest = require("./ServiceRequest");

// Set up associations
User.hasMany(ServiceRequest, { foreignKey: "userId" });
ServiceRequest.belongsTo(User, { foreignKey: "userId" });

Service.hasMany(ServiceRequest, { foreignKey: "serviceId" });
ServiceRequest.belongsTo(Service, { foreignKey: "serviceId" });

// Export sequelize and models
module.exports = {
  sequelize,
  User,
  Service,
  ServiceRequest,
};
