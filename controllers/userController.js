const userService = require("../services/userService");
const { registrationSchema } = require("../utils/validation");

async function createUser(req, res) {
  try {
    const data = { ...req.body };

    if (req.files?.profilePic) {
      data.profilePic = req.files.profilePic[0].filename;
    }

    if (req.files?.idFile) {
      data.idFile = req.files.idFile[0].filename;
    }

    const { error } = registrationSchema.validate(data);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const user = await userService.createUser(data);
    res.status(201).json(user);
  } catch (err) {
    if (
      err.name === "SequelizeUniqueConstraintError" &&
      err.errors[0].path === "email"
    ) {
      return res.status(400).json({ message: "Email already exists" });
    }

    console.error(err);
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
    const data = { ...req.body };

    // Correct field names from multer upload
    if (req.files?.profilePic) {
      data.profilePic = req.files.profilePic[0].filename;
    }

    if (req.files?.idFile) {
      data.idFile = req.files.idFile[0].filename; // match "idFile"
    }

    const updatedUser = await userService.updateUser(req.params.id, data);
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
