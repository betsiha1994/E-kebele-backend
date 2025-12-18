const express = require('express');
const router = express.Router();
const generateCertificate = require('../utils/generateCertificate');

router.post('/generate', async (req, res) => {
    try {
        const { name, kebele } = req.body;

        if (!name || !kebele) {
            return res.status(400).json({ error: "Name and Kebele are required" });
        }

        const date = new Date().toLocaleDateString();

        const result = await generateCertificate({ name, kebele, date });

        res.json({
            message: "Certificate generated successfully",
            filePath: result.filePath,
            filename: result.filename
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error generating certificate" });
    }
});

module.exports = router;
