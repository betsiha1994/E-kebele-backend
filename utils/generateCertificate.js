const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function generateCertificate(data) {

    const { name, kebele, date } = data;

    // Read template file
    const templatePath = path.join(__dirname, '../templates/certificate.html');
    let template = fs.readFileSync(templatePath, 'utf8');

    // Replace placeholders
    template = template
        .replace('{{name}}', name)
        .replace('{{kebele}}', kebele)
        .replace('{{date}}', date);

    // Launch browser
    const browser = await puppeteer.launch({
        headless: true // run without opening window
    });

    const page = await browser.newPage();

    // Set HTML content
    await page.setContent(template, { waitUntil: 'networkidle0' });

    // PDF output path
    const outputDir = path.join(__dirname, '../certificates');

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    const filename = `${Date.now()}-${name}-certificate.pdf`;
    const filePath = path.join(outputDir, filename);

    // Generate PDF
    await page.pdf({
        path: filePath,
        format: 'A4',
        printBackground: true
    });

    await browser.close();

    return {
        success: true,
        filePath,
        filename
    };
}

module.exports = generateCertificate;
