const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Credentials from environment variables
const ADMIN_ID = process.env.ADMIN_ID || 'jjssjw';
const ADMIN_PW = process.env.ADMIN_PASSWORD || '01052181377';

// Multer setup for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/images/products'));
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '.jpg');
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
        if (fs.existsSync(dataFile)) {
            inquiries = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
        }
    } catch (e) {
        console.error('Error reading inquiries:', e);
    }

    // Reverse for latest first
    inquiries.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.render('admin/dashboard', { inquiries });
});

/* POST image upload */
router.post('/upload', checkAuth, upload.any(), (req, res) => {
    res.redirect('/admin');
});

/* GET logout */
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

module.exports = router;
