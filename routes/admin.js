const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const ADMIN_ID = process.env.ADMIN_ID || 'jjssjw';
const ADMIN_PW = process.env.ADMIN_PASSWORD || '01052181377';

// Multer setup for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/images/products'));
    },
    filename: function (req, file, cb) {
        // Use the fieldname as filename (e.g., product1.jpg) to overwrite
        // We expect the input name to be the target filename (product1.jpg)
        // Or we can pass it as a body param.
        // Let's use a query param or body param for target filename, 
        // OR better: strict mapping based on the upload form.
        // The user wants "Image slots". Let's say inputs are named "product1", "product2"...
        // But multer `file` object has `fieldname`.
        // Let's enforce extension to be .jpg for simplicity or keep original ext?
        // User said: "Filename fixed (product1.jpg etc)"
        // So we will force rename to productX.jpg
        cb(null, file.fieldname + '.jpg');
        // Note: this assumes input name is 'product1', 'product2', etc.
    }
});

const upload = multer({ storage: storage });

/* Middleware to check auth */
const checkAuth = (req, res, next) => {
    if (req.session.isAdmin) {
        next();
    } else {
        res.redirect('/admin/login');
    }
};

/* GET admin login page */
router.get('/login', (req, res) => {
    if (req.session.isAdmin) return res.redirect('/admin');
    res.render('admin/login', { error: null });
});

/* POST admin login */
router.post('/login', (req, res) => {
    const { id, password } = req.body;
    if (id === ADMIN_ID && password === ADMIN_PW) {
        req.session.isAdmin = true;
        res.redirect('/admin');
    } else {
        res.render('admin/login', { error: 'Invalid ID or Password' });
    }
});

/* GET admin dashboard */
router.get('/', checkAuth, (req, res) => {
    // Read inquiries
    const dataFile = path.join(__dirname, '../data/inquiries.json');
    let inquiries = [];
    try {
        inquiries = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
    } catch (e) { }

    // Reverse for latest first
    inquiries.sort((a, b) => b.id - a.id);

    // List product images
    // We expect product1.jpg to product6.jpg
    // Check which exist
    const products = [];
    for (let i = 1; i <= 6; i++) {
        const pName = `product${i}.jpg`;
        const pPath = path.join(__dirname, `../public/images/products/${pName}`);
        products.push({
            name: pName,
            exists: fs.existsSync(pPath),
            id: `product${i}`
        });
    }

    res.render('admin/dashboard', { inquiries, products });
});

/* POST image upload */
// We allow uploading one by one.
router.post('/upload', checkAuth, upload.any(), (req, res) => {
    // Multer handles the upload and rename based on fieldname.
    // fieldname should be 'product1', 'product2' etc.
    res.redirect('/admin');
});

/* GET logout */
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

module.exports = router;
