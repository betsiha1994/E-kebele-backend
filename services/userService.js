const prisma = require("../prisma");
const bcrypt = require("bcrypt");

async function createUser({ name, email, password, role = "resident" }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return await prisma.user.create({
    data: { name, email, password: hashedPassword, role },
  });
}

async function getAllUsers() {
  return await prisma.user.findMany();
}

async function getUserById(id) {
  return await prisma.user.findUnique({ where: { id: parseInt(id) } });
}

async function updateUser(id, updateData) {
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }
  return await prisma.user.update({
    where: { id: parseInt(id) },
    data: updateData,
  });
}

async function deleteUser(id) {
  return await prisma.user.delete({ where: { id: parseInt(id) } });
}

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
