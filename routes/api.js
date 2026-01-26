const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, '../data/inquiries.json');

router.post('/inquiry', (req, res) => {
    const { name, contact, message } = req.body;

    if (!name || !contact || !message) {
        return res.status(400).send('All fields are required.');
    }

    let inquiries = [];
    try {
        if (fs.existsSync(dataFile)) {
            const data = fs.readFileSync(dataFile, 'utf-8');
            inquiries = JSON.parse(data);
        }
    } catch (err) {
        console.error('Error reading data file:', err);
    }

    const newInquiry = {
        id: Date.now(),
        name,
        contact,
        message,
        date: new Date().toISOString()
    };

    inquiries.push(newInquiry);

    try {
        fs.writeFileSync(dataFile, JSON.stringify(inquiries, null, 2));
    } catch (err) {
        console.error('Error writing data file:', err);
    }

    res.redirect('/?msg=success');
});

module.exports = router;
