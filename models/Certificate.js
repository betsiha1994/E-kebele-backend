const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Certificate = sequelize.define(
  "Certificate",
  {
    filename: { type: DataTypes.STRING, allowNull: false },
    filePath: { type: DataTypes.STRING, allowNull: false },
    requestId: { type: DataTypes.INTEGER, allowNull: false },
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
  },
  { timestamps: true }
);

module.exports = Certificate;
