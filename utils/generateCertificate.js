const fs = require("fs");
const path = require("path");
require("dotenv").config();
const puppeteer = require("puppeteer");
const ejs = require("ejs");

// Helper function to convert image to base64
function imageToBase64(filePath) {
  try {
    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString("base64");
    const extension = path.extname(filePath).toLowerCase();

    // Determine MIME type
    let mimeType;
    switch (extension) {
      case ".png":
        mimeType = "image/png";
        break;
      case ".jpg":
      case ".jpeg":
        mimeType = "image/jpeg";
        break;
      case ".gif":
        mimeType = "image/gif";
        break;
      case ".svg":
        mimeType = "image/svg+xml";
        break;
      default:
        mimeType = "image/png";
    }

    return `data:${mimeType};base64,${base64Image}`;
  } catch (error) {
    console.error(`Error converting image to base64: ${error.message}`);
    return null;
  }
}

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

  // Define paths
  const signaturePath = path.join(__dirname, "../assets/signature.png");
  const stampPath = path.join(__dirname, "../assets/stamp.png");

  console.log("Signature path:", signaturePath);
  console.log("Signature exists:", fs.existsSync(signaturePath));
  console.log("Stamp exists:", fs.existsSync(stampPath));

  if (!fs.existsSync(signaturePath)) {
    throw new Error(`Signature image NOT FOUND at: ${signaturePath}`);
  }

  if (!fs.existsSync(stampPath)) {
    throw new Error(`Stamp image NOT FOUND at: ${stampPath}`);
  }

  // Convert images to base64
  const signatureBase64 = imageToBase64(signaturePath);
  const stampBase64 = imageToBase64(stampPath);

  if (!signatureBase64 || !stampBase64) {
    throw new Error("Failed to convert images to base64");
  }

  // ✅ Render HTML using EJS
  const html = await ejs.renderFile(templatePath, {
    certificateTitle,
    name,
    kebele,
    phone,
    description,
    date: issueDate,
    certificateId,
    signatureBase64,
    stampBase64,
  });

  // Save HTML for debugging
  fs.writeFileSync("debug_output.html", html);
  console.log("✅ HTML saved to debug_output.html");
  console.log("📄 HTML size:", html.length, "characters");

  // Launch Puppeteer
  console.log("🚀 Launching Puppeteer...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-web-security",
    ],
  });

  try {
    const page = await browser.newPage();
    console.log("🌐 New page created");

    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });

    // Set longer timeout
    await page.setDefaultNavigationTimeout(60000);
    await page.setDefaultTimeout(60000);

    // Set content - IMPORTANT: Use 'load' instead of 'networkidle0' for better reliability
    console.log("📝 Setting HTML content...");
    await page.setContent(html, {
      waitUntil: "load",
      timeout: 60000,
    });
    console.log("✅ HTML content set");

    // Wait for images to load - CORRECT WAY for Puppeteer v24
    console.log("⏳ Waiting for images to load...");
    await page.evaluate(() => {
      return new Promise((resolve) => {
        let imagesLoaded = 0;
        const totalImages = document.querySelectorAll("img").length;

        if (totalImages === 0) {
          resolve();
          return;
        }

        document.querySelectorAll("img").forEach((img) => {
          if (img.complete) {
            imagesLoaded++;
          } else {
            img.addEventListener("load", () => {
              imagesLoaded++;
              if (imagesLoaded === totalImages) resolve();
            });
            img.addEventListener("error", () => {
              imagesLoaded++;
              if (imagesLoaded === totalImages) resolve();
            });
          }
        });

        if (imagesLoaded === totalImages) {
          resolve();
        }
      });
    });

    console.log("✅ Images loaded (or attempted)");

    // Short delay for rendering
    await new Promise((resolve) => setTimeout(resolve, 500));

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
    console.log("📄 Generating PDF...");
    await page.pdf({
      path: filePath,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "20mm",
        right: "20mm",
        bottom: "20mm",
        left: "20mm",
      },
    });

    console.log("✅ PDF generated successfully at:", filePath);

    // Check if file was created
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log("📊 PDF file size:", stats.size, "bytes");
    } else {
      console.error("❌ PDF file was not created!");
    }

    return {
      success: true,
      filePath,
      filename,
      certificateId,
      dateIssued: issueDate,
      downloadUrl: `/certificates/${filename}`,
    };
  } catch (error) {
    console.error("❌ Error generating PDF:", error.message);
    console.error(error.stack);
    throw error;
  } finally {
    await browser.close();
    console.log("🔴 Browser closed");
  }
}

module.exports = generateCertificate;
