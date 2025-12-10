const express = require("express");
const router = express.Router();
const multer = require("multer");
const userController = require("../controllers/userController");

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"), // files stored in /uploads
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// Create user with profilePic and idFile
router.post(
  "/",
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "idFile", maxCount: 1 },
  ]),
  userController.createUser
);

// Get all users
router.get("/", userController.getAllUsers);

// Get user by ID
router.get("/:id", userController.getUserById);

// Update user with profilePic and idFile
router.put(
  "/:id",
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "idFile", maxCount: 1 },
  ]),
  userController.updateUser
);

// Delete user
router.delete("/:id", userController.deleteUser);

module.exports = router;
