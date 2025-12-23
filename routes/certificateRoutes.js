const express = require("express");
const router = express.Router();
const { deleteCertificate } = require("../controllers/certificateController");
// const auth = require("../middleware/auth");

router.delete("/certificates/:id", deleteCertificate);

module.exports = router;
