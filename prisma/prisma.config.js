// prisma/prisma.config.js
const config = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
};

module.exports = config;
