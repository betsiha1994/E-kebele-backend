const path = require("path");
const fs = require("fs");

const viewDocument = async (req, res) => {
  try {
    const { filename } = req.params;

    const filePath = path.join(__dirname, "../uploads", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    // view file in browser
    res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({ message: "Unable to view file" });
  }
};

const downloadDocument = async (req, res) => {
  try {
    const { filename } = req.params;

    const filePath = path.join(__dirname, "../uploads", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    // force download
    res.download(filePath);
  } catch (err) {
    res.status(500).json({ message: "Unable to download file" });
  }
};

module.exports = {
  viewDocument,
  downloadDocument,
};
