const fs = require("fs");
const path = require("path");
require("dotenv").config();
const puppeteer = require("puppeteer");
const ejs = require("ejs");

async function generateCertificate(data) {
  const { certificateTitle, name, kebele, phone, description } = data;

  // Auto-generate date
  const issueDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Auto-generate certificate ID
  const certificateId = `CERT-${Date.now()}`;

  // Path to EJS template
  const templatePath = path.join(__dirname, "../templates/certificate.html");
  const signaturePath = `file:///${path
    .resolve(__dirname, "../assets/signature.png")
    .replace(/\\/g, "/")}`;

  const stampPath = `file:///${path
    .resolve(__dirname, "../assets/stamp.png")
    .replace(/\\/g, "/")}`;

  // ✅ Render HTML using EJS
  const html = await ejs.renderFile(templatePath, {
    certificateTitle,
    name,
    kebele,
    phone,
    description,
    date: issueDate,
    certificateId,
    signaturePath,
    stampPath,
  });

  // Launch Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--allow-file-access-from-files",
    ],
  });

  const page = await browser.newPage();
  await page.setBypassCSP(true);
  await page.setContent(html, { waitUntil: "networkidle0" });

  // Ensure output directory exists
  const outputDir = path.join(__dirname, "../certificates");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Create file name
  const safeName = (name || "certificate").replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `certificate_${safeName}_${Date.now()}.pdf`;
  const filePath = path.join(outputDir, filename);

  // Generate PDF
  await page.pdf({
    path: filePath,
    format: "A4",
    printBackground: true,
    margin: {
      top: "20mm",
      right: "20mm",
      bottom: "20mm",
      left: "20mm",
    },
  });

  await browser.close();

  return {
    success: true,
    filePath,
    filename,
    certificateId,
    dateIssued: issueDate,
    downloadUrl: `/certificates/${filename}`,
  };
}

module.exports = generateCertificate;
