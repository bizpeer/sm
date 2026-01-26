const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Load locales
const locales = {
    ko: JSON.parse(fs.readFileSync(path.join(__dirname, '../locales/ko.json'), 'utf-8')),
    en: JSON.parse(fs.readFileSync(path.join(__dirname, '../locales/en.json'), 'utf-8')),
    jp: JSON.parse(fs.readFileSync(path.join(__dirname, '../locales/jp.json'), 'utf-8')),
    cn: JSON.parse(fs.readFileSync(path.join(__dirname, '../locales/cn.json'), 'utf-8'))
};

const getProducts = () => {
    const imagesDir = path.join(__dirname, '../public/images/products');
    try {
        const files = fs.readdirSync(imagesDir);
        return files.filter(file => /\.(jpg|jpeg|png)$/i.test(file)).sort();
    } catch (e) {
        return [];
    }
};

/* Middleware to handle language */
const handleLang = (req, res, next) => {
    const lang = req.params.lang || 'ko';
    if (!locales[lang]) return next(); // 404 if invalid lang
    res.locals.lang = lang;
    res.locals.t = locales[lang];
    res.locals.products = getProducts();
    next();
};

/* GET home page. */
router.get('/', (req, res, next) => {
    res.locals.lang = 'ko';
    res.locals.t = locales['ko'];
    res.locals.products = getProducts();
    res.render('index');
});

router.get('/:lang', handleLang, (req, res, next) => {
    // If lang is not in the allowed list, handleLang middleware calls next() which falls through to 404
    // But since handleLang calls next() if invalid, we might match this route again?
    // Actually handleLang implementation was:
    // if (!locales[lang]) return next(); 
    // If we return next(), it goes to the next matching route.
    // So if I have /:lang, it matches everything.
    // I need to check if it is a valid lang here or in middleware.

    // Let's refine handleLang to be more strict or check here.
    if (res.locals.lang && ['en', 'jp', 'cn'].includes(res.locals.lang)) {
        res.render('index');
    } else {
        next();
    }
});

// Inquiry Page
router.get('/inquiry', (req, res) => {
    res.locals.lang = 'ko';
    res.locals.t = locales['ko'];
    res.render('inquiry');
});

router.get('/:lang/inquiry', handleLang, (req, res, next) => {
    if (res.locals.lang && ['en', 'jp', 'cn'].includes(res.locals.lang)) {
        res.render('inquiry');
    } else {
        next();
    }
});

module.exports = router;
