const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function generateCertificate(data) {
    const { name, kebele } = data; // No date parameter needed

    // Auto-generate the issue date
    const currentDate = new Date();
    
    // Format: "December 20, 2023" - clean and professional
    const issueDate = currentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // For Ethiopian format if needed: "20 December 2023"
    // const issueDate = `${currentDate.getDate()} ${currentDate.toLocaleString('en-US', { month: 'long' })} ${currentDate.getFullYear()}`;

    // Read template
    const templatePath = path.join(__dirname, '../templates/certificate.html');
    let template = fs.readFileSync(templatePath, 'utf8');

    // Replace placeholders
    template = template
        .replace(/{{name}}/g, name || "")
        .replace(/{{kebele}}/g, kebele || "")
        .replace(/{{date}}/g, issueDate) // Auto-generated date
        .replace(/{{certificateId}}/g, `CERT-${Date.now()}`);

    // Generate PDF
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(template, { waitUntil: 'networkidle0' });

    // Output
    const outputDir = path.join(__dirname, '../certificates');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const safeName = (name || 'certificate').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `certificate_${safeName}_${Date.now()}.pdf`;
    const filePath = path.join(outputDir, filename);

    await page.pdf({
        path: filePath,
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
    });

    await browser.close();

    return {
        success: true,
        filePath,
        filename,
        dateIssued: issueDate,
        downloadUrl: `/certificates/${filename}`
    };
}

module.exports = generateCertificate;