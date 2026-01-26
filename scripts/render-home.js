const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const languages = ['ko', 'en', 'jp', 'cn'];

languages.forEach(lang => {
    const t = JSON.parse(fs.readFileSync(path.join(__dirname, '../locales', lang + '.json'), 'utf-8'));
    const renderData = {
        lang: lang,
        t: t,
        products: ['image1.png', 'image2.png', 'image3.png', 'image4.png', 'image5.png', 'image6.png'],
        baseUrl: '/sm'
    };

    // Ensure directory exists
    const langDir = lang === 'ko' ? path.join(__dirname, '..') : path.join(__dirname, '..', lang);
    if (!fs.existsSync(langDir)) {
        fs.mkdirSync(langDir, { recursive: true });
    }

    // Render index.html
    const indexTemplate = fs.readFileSync(path.join(__dirname, '../views/index.ejs'), 'utf-8');
    const indexHtml = ejs.render(indexTemplate, {
        ...renderData,
        filename: path.join(__dirname, '../views/index.ejs')
    });
    fs.writeFileSync(path.join(langDir, 'index.html'), indexHtml);
    console.log(`Generated ${lang}/index.html`);

    // Render inquiry.html
    const inquiryTemplate = fs.readFileSync(path.join(__dirname, '../views/inquiry.ejs'), 'utf-8');
    const inquiryHtml = ejs.render(inquiryTemplate, {
        ...renderData,
        filename: path.join(__dirname, '../views/inquiry.ejs')
    });
    fs.writeFileSync(path.join(langDir, 'inquiry.html'), inquiryHtml);
    console.log(`Generated ${lang}/inquiry.html`);
});
