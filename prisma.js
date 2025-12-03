const { PrismaClient } = require("@prisma/client");

const config = require("./prisma/prisma.config");

const prisma = new PrismaClient(config);

module.exports = prisma;
