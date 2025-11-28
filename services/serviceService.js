const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


const getAllServices = async () => {
  return await prisma.service.findMany();
};

const getServiceById = async (id) => {
  return await prisma.service.findUnique({ where: { id: parseInt(id) } });
};

const createService = async (data) => {
  return await prisma.service.create({ data });
};

const updateService = async (id, data) => {
  return await prisma.service.update({ where: { id: parseInt(id) }, data });
};

const deleteService = async (id) => {
  return await prisma.service.delete({ where: { id: parseInt(id) } });
};

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
