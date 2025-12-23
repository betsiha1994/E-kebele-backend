const fs = require("fs");
const path = require("path");
const { Certificate } = require("../models");

exports.deleteCertificate = async (req, res) => {
  try {
    const { id } = req.params;

    const certificate = await Certificate.findByPk(id);
    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    const filePath = path.join(
      __dirname,
      "../certificates",
      certificate.filename
    );

    // Delete PDF file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete DB record
    await certificate.destroy();

    res.json({ message: "Certificate deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete certificate" });
  }
};
