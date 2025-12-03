const { Sequelize } = require("sequelize");
require('dotenv').config();


// Use your Neon DATABASE_URL from .env
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // important for Neon
    },
  },
  logging: false, // optional: set to true to see SQL queries
});

module.exports = sequelize;
