const fs = require("fs");
const path = require("path");
require("dotenv").config();
const puppeteer = require("puppeteer");
const ejs = require("ejs");

// Helper function to convert image to base64
function imageToBase64(filePath) {
  try {
    console.log(`📷 Attempting to read image: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      console.error(`❌ Image file not found: ${filePath}`);
      return null;
    }

    // Check file size
    const stats = fs.statSync(filePath);
    console.log(`📊 Image size: ${stats.size} bytes`);

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

    const result = `data:${mimeType};base64,${base64Image}`;
    console.log(
      `✅ Base64 conversion successful. Length: ${result.length} chars`
    );
    console.log(`🔍 Base64 starts with: ${result.substring(0, 50)}...`);

    return result;
  } catch (error) {
    console.error(`❌ Error converting image to base64: ${error.message}`);
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

  console.log("\n=== IMAGE PATH VERIFICATION ===");
  console.log("Signature path:", signaturePath);
  console.log("Signature exists:", fs.existsSync(signaturePath));
  console.log("Stamp path:", stampPath);
  console.log("Stamp exists:", fs.existsSync(stampPath));

  if (!fs.existsSync(signaturePath)) {
    throw new Error(`Signature image NOT FOUND at: ${signaturePath}`);
  }

  if (!fs.existsSync(stampPath)) {
    throw new Error(`Stamp image NOT FOUND at: ${stampPath}`);
  }

  // Convert images to base64
  console.log("\n=== CONVERTING IMAGES TO BASE64 ===");
  const signatureBase64 = imageToBase64(signaturePath);
  const stampBase64 = imageToBase64(stampPath);

  if (!signatureBase64) {
    throw new Error("Failed to convert signature image to base64");
  }
  if (!stampBase64) {
    throw new Error("Failed to convert stamp image to base64");
  }

  // Verify base64 strings are valid
  console.log("\n=== BASE64 VERIFICATION ===");
  console.log(
    "Signature is valid base64:",
    signatureBase64.startsWith("data:image/")
  );
  console.log("Stamp is valid base64:", stampBase64.startsWith("data:image/"));
  console.log("Signature length:", signatureBase64.length);
  console.log("Stamp length:", stampBase64.length);

  // ✅ Render HTML using EJS
  console.log("\n=== RENDERING HTML TEMPLATE ===");
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
  const debugHtmlPath = path.join(__dirname, "../debug_output.html");
  fs.writeFileSync(debugHtmlPath, html);
  console.log(`✅ HTML saved to: ${debugHtmlPath}`);
  console.log(`📄 HTML size: ${html.length} characters`);

  // Launch Puppeteer
  console.log("\n=== LAUNCHING PUPPETEER ===");
  console.log("🚀 Launching Puppeteer...");

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-web-security",
      "--disable-features=VizDisplayCompositor",
      "--font-render-hinting=none",
    ],
    defaultViewport: null,
  });

  try {
    const page = await browser.newPage();
    console.log("🌐 New page created");

    // Set viewport
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });

    // Set longer timeout
    await page.setDefaultNavigationTimeout(60000);
    await page.setDefaultTimeout(60000);

    // Set content
    console.log("📝 Setting HTML content...");
    await page.setContent(html, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    console.log("✅ HTML content set");

    // Wait for images to load using a more reliable method
    console.log("⏳ Waiting for images to load...");
    await page.waitForFunction(
      () => {
        const images = Array.from(document.querySelectorAll("img"));
        if (images.length === 0) return true;

        return images.every((img) => {
          // Check if image is complete OR if it's a base64 image (which should load instantly)
          if (img.complete) return true;
          if (img.src && img.src.startsWith("data:image/")) return true;

          // For data URLs, they should be loaded immediately
          return img.naturalWidth > 0 || img.naturalHeight > 0;
        });
      },
      { timeout: 10000 }
    );

    console.log("✅ Images loaded check completed");

    // Take a screenshot to verify rendering
    const screenshotPath = path.join(__dirname, "../debug_screenshot.png");
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });
    console.log(`📸 Debug screenshot saved: ${screenshotPath}`);

    // Debug: Check image status
    const imageStatus = await page.evaluate(() => {
      const images = document.querySelectorAll("img");
      const status = [];
      images.forEach((img, index) => {
        status.push({
          index,
          src: img.src.substring(0, 100) + "...",
          complete: img.complete,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          width: img.width,
          height: img.height,
          className: img.className,
        });
      });
      return status;
    });

    console.log("🔍 Image status:", JSON.stringify(imageStatus, null, 2));

    // Short delay for rendering
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Ensure output directory exists
    const outputDir = path.join(__dirname, "../certificates");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Create file name
    const safeName = (name || "certificate").replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `certificate_${safeName}_${Date.now()}.pdf`;
    const filePath = path.join(outputDir, filename);

    // Generate PDF with optimized settings
    console.log("\n=== GENERATING PDF ===");
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
      scale: 0.95,
      displayHeaderFooter: false,
      timeout: 30000,
    });

    console.log(`✅ PDF generated successfully at: ${filePath}`);

    // Check if file was created
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`📊 PDF file size: ${stats.size} bytes`);

      // Also check PDF contains data
      const pdfBuffer = fs.readFileSync(filePath);
      console.log(`📄 PDF buffer size: ${pdfBuffer.length} bytes`);

      if (stats.size < 1000) {
        console.warn("⚠️  Warning: PDF file seems unusually small");
      }
    } else {
      throw new Error("❌ PDF file was not created!");
    }

    return {
      success: true,
      filePath,
      filename,
      certificateId,
      dateIssued: issueDate,
      downloadUrl: `/certificates/${filename}`,
      debug: {
        htmlPath: debugHtmlPath,
        screenshotPath: screenshotPath,
      },
    };
  } catch (error) {
    console.error("\n❌ ERROR GENERATING PDF:");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);

    // Try to get page error if available
    try {
      const page = await browser.newPage();
      const errors = [];
      page.on("pageerror", (err) => {
        errors.push(err.toString());
      });
      await page.setContent("<html></html>");
      console.error("Page errors:", errors);
    } catch (e) {
      // Ignore
    }

    throw error;
  } finally {
    await browser.close();
    console.log("🔴 Browser closed");
  }
}

// Test function
async function testCertificateGeneration() {
  console.log("🧪 TESTING CERTIFICATE GENERATION 🧪");

  const testData = {
    certificateTitle: "CERTIFICATE OF RESIDENCY",
    name: "Asres Yayeh",
    kebele: "Bole Sub-city, Kebele 05",
    phone: "+251 91 234 5678",
    description:
      "This is to certify that the above-mentioned person is a legal resident of our kebele and is entitled to all rights and privileges accorded to residents.",
  };

  try {
    const result = await generateCertificate(testData);
    console.log("\n🎉 TEST SUCCESSFUL!");
    console.log("Result:", {
      success: result.success,
      filePath: result.filePath,
      filename: result.filename,
      certificateId: result.certificateId,
    });

    // Instructions for checking
    console.log("\n🔍 NEXT STEPS:");
    console.log("1. Open debug_output.html in your browser");
    console.log("2. Check if images are visible");
    console.log("3. Open the generated PDF");
    console.log("4. Compare with the HTML version");
  } catch (error) {
    console.error("\n❌ TEST FAILED:", error.message);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testCertificateGeneration()
    .then(() => {
      console.log("\n✅ Test completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Test failed with error:", error);
      process.exit(1);
    });
}

module.exports = generateCertificate;
