const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const config = {
    baseUrl: '/sm', // GitHub Pages repository name
    outDir: path.join(__dirname, '../dist')
};

// Load locales
const locales = {
    ko: JSON.parse(fs.readFileSync(path.join(__dirname, '../locales/ko.json'), 'utf-8')),
    en: JSON.parse(fs.readFileSync(path.join(__dirname, '../locales/en.json'), 'utf-8')),
    jp: JSON.parse(fs.readFileSync(path.join(__dirname, '../locales/jp.json'), 'utf-8')),
    cn: JSON.parse(fs.readFileSync(path.join(__dirname, '../locales/cn.json'), 'utf-8'))
};

// Get products
const getProducts = () => {
    const imagesDir = path.join(__dirname, '../public/images/products');
    try {
        const files = fs.readdirSync(imagesDir);
        return files.filter(file => /\.(jpg|jpeg|png)$/i.test(file)).sort();
    } catch (e) {
        return [];
    }
};

const products = getProducts();

// Ensure dist dir
if (!fs.existsSync(config.outDir)) {
    fs.mkdirSync(config.outDir);
}

// Copy public assets recursively
const copyRecursiveSync = (src, dest) => {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest);
        fs.readdirSync(src).forEach((childItemName) => {
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
};

console.log('Copying public assets...');
copyRecursiveSync(path.join(__dirname, '../public'), config.outDir);

// Helper to render file
const render = (templateName, data, outputPath) => {
    const templatePath = path.join(__dirname, '../views', templateName + '.ejs');
    ejs.renderFile(templatePath, {
        ...data,
        products,
        baseUrl: config.baseUrl
    }, (err, str) => {
        if (err) {
            console.error(`Error rendering ${templateName}:`, err);
            return;
        }
        // Ensure dir exists
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        fs.writeFileSync(outputPath, str);
        console.log(`Generated ${outputPath}`);
    });
};

console.log('Building pages...');

// 1. Home Pages
// Korean (Root)
render('index', { lang: 'ko', t: locales.ko }, path.join(config.outDir, 'index.html'));

// Other Languages
['en', 'jp', 'cn'].forEach(lang => {
    render('index', { lang: lang, t: locales[lang] }, path.join(config.outDir, lang, 'index.html'));
});

// 2. Inquiry Pages
// Korean
render('inquiry', { lang: 'ko', t: locales.ko }, path.join(config.outDir, 'inquiry.html'));

// Other Languages
['en', 'jp', 'cn'].forEach(lang => {
    render('inquiry', { lang: lang, t: locales[lang] }, path.join(config.outDir, lang, 'inquiry.html'));
});

// 3. Admin Login (Mockup)
render('admin/login', { error: null, baseUrl: config.baseUrl }, path.join(config.outDir, 'admin/login.html'));
// Note: Dashboard is protected and dynamic, cannot be SSG'd easily without mock data.
// We will just skip generating dashboard or generate a static version that says "Not available".

console.log('Build complete.');
