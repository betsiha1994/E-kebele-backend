require('dotenv').config();
const sequelize = require("./db");



async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("Database connection successful!");
  } catch (err) {
    console.error("Database connection failed:", err);
  }
}

testConnection();
