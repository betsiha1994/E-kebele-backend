const path = require("path");
const fs = require("fs");
const mime = require("mime-types");

const UPLOAD_DIR = path.resolve(__dirname, "../uploads");

const viewDocument = async (req, res) => {
  try {
    const safeFileName = path.basename(req.params.filename);
    const filePath = path.join(UPLOAD_DIR, safeFileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    const contentType = mime.lookup(filePath) || "application/octet-stream";
    res.setHeader("Content-Type", contentType);

    res.sendFile(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to view file" });
  }
};

const downloadDocument = async (req, res) => {
  try {
    const safeFileName = path.basename(req.params.filename);
    const filePath = path.join(UPLOAD_DIR, safeFileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    res.download(filePath, safeFileName);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to download file" });
  }
};

module.exports = {
  viewDocument,
  downloadDocument,
};
