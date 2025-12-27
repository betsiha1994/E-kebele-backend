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
  // const signatureBase64 = imageToBase64(signaturePath);
  // const stampBase64 = imageToBase64(stampPath);
  const signatureBase64 = 'data:image/png;base64,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';


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
