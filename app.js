require('dotenv').config();
const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const app = express();

const PORT = process.env.PORT || 3000;
const DATA_PATH = path.join(__dirname, 'data', 'inquiries.json');

// Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

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
app.post('/api/inquiry', async (req, res) => {
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

    // 이메일 알림 전송
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'jjssjw88@gmail.com',
            subject: `[SM 자연석] 새로운 문의가 접수되었습니다 - ${name}님`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                    <h2 style="color: #333; border-bottom: 2px solid #5a5a5a; padding-bottom: 10px;">새로운 문의가 접수되었습니다.</h2>
                    <p style="margin: 10px 0;"><strong>이름:</strong> ${name}</p>
                    <p style="margin: 10px 0;"><strong>연락처:</strong> ${contact}</p>
                    <p style="margin: 10px 0;"><strong>관심 상품:</strong> ${product || '선택 안됨'}</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
                    <p style="margin: 10px 0;"><strong>문의 내용:</strong></p>
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${message}</div>
                </div>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log('이메일 알림 전송 성공');
        } catch (error) {
            console.error('이메일 알림 전송 실패:', error);
        }
    } else {
        console.warn('이메일 알림 전송 생략: EMAIL_USER 또는 EMAIL_PASS 환경 변수가 설정되지 않았습니다.');
    }

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
    if (id === 'jjssjw' && password === 'sang@4478') {
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
