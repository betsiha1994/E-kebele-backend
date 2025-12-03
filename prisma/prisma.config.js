// Prisma Client configuration
module.exports = {
  log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error"]
};
