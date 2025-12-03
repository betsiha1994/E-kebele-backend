const bcrypt = require("bcrypt");
const User = require("../models/User");

// Create a new user
async function createUser({ name, email, password, phone, role = "resident" }) {
  // Check if user already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error("Email already registered");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await User.create({
    name,
    email,
    phone,
    role,
    password: hashedPassword,
  });

  return user;
}

// Get all users
async function getAllUsers() {
  return await User.findAll();
}

// Get a user by ID
async function getUserById(id) {
  return await User.findByPk(id);
}

// Update a user
async function updateUser(id, updateData) {
  const user = await User.findByPk(id);
  if (!user) throw new Error("User not found");

  // Hash new password if provided
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  await user.update(updateData);
  return user;
}

// Delete a user
async function deleteUser(id) {
  const user = await User.findByPk(id);
  if (!user) throw new Error("User not found");

  await user.destroy();
  return true;
}

// Get a user by email
async function getUserByEmail(email) {
  return await User.findOne({ where: { email } });
}

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserByEmail,
};
