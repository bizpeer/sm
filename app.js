require('dotenv').config();
const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;
const DATA_PATH = path.join(__dirname, 'data', 'inquiries.json');

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'sm-natural-stone-secret-2026',
    resave: false,
    saveUninitialized: true
}));

// Set default baseUrl for EJS
app.locals.baseUrl = '';

// Ensure data folder and file exists
if (!fs.existsSync(path.join(__dirname, 'data'))) fs.mkdirSync(path.join(__dirname, 'data'));
if (!fs.existsSync(DATA_PATH)) fs.writeFileSync(DATA_PATH, '[]');

// Routes
app.get('/', (req, res) => res.render('index'));
app.get('/inquiry', (req, res) => res.render('inquiry', { product: req.query.product || '' }));

// API: Save Inquiry
app.post('/api/inquiry', (req, res) => {
    const { name, contact, message, product } = req.body;
    let inquiries = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

    inquiries.push({
        id: Date.now(),
        date: new Date(),
        name,
        contact,
        message,
        product
    });

    fs.writeFileSync(DATA_PATH, JSON.stringify(inquiries, null, 2));
    res.send('<script>alert("문의가 성공적으로 접수되었습니다."); location.href="/";</script>');
});

// Admin: Login Page
app.get('/admin', (req, res) => {
    if (req.session.isAdmin) return res.redirect('/admin/dashboard');
    res.render('admin/login');
});

// Admin: Auth Logic
app.post('/admin/login', (req, res) => {
    const { id, password } = req.body;
    if (id === 'jjssjw' && password === '01052181377') {
        req.session.isAdmin = true;
        res.redirect('/admin/dashboard');
    } else {
        res.render('admin/login', { error: 'ID 또는 비밀번호가 틀렸습니다.' });
    }
});

// Admin: Dashboard
app.get('/admin/dashboard', (req, res) => {
    if (!req.session.isAdmin) return res.redirect('/admin');
    let inquiries = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    // Sort by newest first
    inquiries.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.render('admin/dashboard', { inquiries });
});

// Admin: Logout
app.get('/admin/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin');
});

app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));
