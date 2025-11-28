const { PrismaConfig } = require("@prisma/client");

const config = {
  adapter: {
    url: process.env.DATABASE_URL, // your Neon connection string from .env
  },
};

module.exports = config;
