const userService = require("../services/userService");

async function createUser(req, res) {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create user" });
  }
}

async function getAllUsers(req, res) {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

async function getUserById(req, res) {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
}

async function updateUser(req, res) {
  try {
    const updatedUser = await userService.updateUser(req.params.id, req.body);
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update user" });
  }
}

async function deleteUser(req, res) {
  try {
    await userService.deleteUser(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete user" });
  }
}

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
