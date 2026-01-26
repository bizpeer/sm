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
        const data = fs.readFileSync(dataFile, 'utf-8');
        inquiries = JSON.parse(data);
    } catch (err) {
        // file might not exist or be empty
    }

    const newInquiry = {
        id: Date.now(),
        name,
        contact,
        message,
        date: new Date().toLocaleString()
    };

    inquiries.push(newInquiry);

    fs.writeFileSync(dataFile, JSON.stringify(inquiries, null, 2));

    // Redirect back to home or a thank you page. For now, alert and redirect.
    // Since it's a form submit, we can render a success page or redirect.
    // Let's redirect to home with a query param for success message (handled by client js if we had it, or just simple redirect)
    res.redirect('/?msg=success');
});

module.exports = router;
