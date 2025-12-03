const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Service = sequelize.define(
  "Service",
  {
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: "pending" },
    image: { type: DataTypes.STRING },
    formFields: { type: DataTypes.JSON },
    slug: { type: DataTypes.STRING },
  },
  { timestamps: true }
);

module.exports = Service;
