// prisma/prisma.config.js
const config = {
  adapter: { url: process.env.DATABASE_URL },
};

module.exports = config;
