const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

// Render configuration
const renderData = {
    lang: 'ko',
    t: JSON.parse(fs.readFileSync(path.join(__dirname, '../locales/ko.json'), 'utf-8')),
    products: ['image1.png', 'image2.png', 'image3.png', 'image4.png', 'image5.png', 'image6.png'],
    baseUrl: '/sm'
};

// Ensure view render function works with simpler context
const template = fs.readFileSync(path.join(__dirname, '../views/index.ejs'), 'utf-8');
const html = ejs.render(template, {
    ...renderData,
    filename: path.join(__dirname, '../views/index.ejs') // needed for include
});

fs.writeFileSync(path.join(__dirname, '../index.html'), html);
console.log('Generated index.html for GitHub Pages preview');
