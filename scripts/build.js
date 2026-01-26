const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const config = {
    baseUrl: '/sm', // Repository name
    outDir: path.join(__dirname, '../dist')
};

const viewsDir = path.join(__dirname, '../views');

// Ensure outDir exists
if (!fs.existsSync(config.outDir)) {
    fs.mkdirSync(config.outDir, { recursive: true });
}

// Helper to copy directory
const copyRecursiveSync = (src, dest) => {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach(childItemName => {
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
};

// 1. Copy public assets
console.log('Copying assets...');
copyRecursiveSync(path.join(__dirname, '../public'), config.outDir);

// 2. Render EJS files
const pages = [
    { template: 'index.ejs', output: 'index.html', data: {} },
    { template: 'inquiry.ejs', output: 'inquiry.html', data: { product: '' } },
    { template: 'admin/login.ejs', output: 'admin/index.html', data: {} },
    // Dashboard mockup
    {
        template: 'admin/dashboard.ejs', output: 'admin/dashboard.html', data: {
            inquiries: [
                { id: 1, date: new Date(), name: '홍길동', contact: '010-1234-5678', message: '자연석 대리석 문의드립니다.', product: 'Stone-1' }
            ]
        }
    }
];

pages.forEach(page => {
    const templatePath = path.join(viewsDir, page.template);
    ejs.renderFile(templatePath, {
        ...page.data,
        baseUrl: config.baseUrl
    }, (err, str) => {
        if (err) {
            console.error(`Error rendering ${page.template}:`, err);
            return;
        }

        // Fix asset paths in rendered HTML for static hosting (/sm/...)
        const fixedStr = str.replace(/href="\//g, `href="${config.baseUrl}/`)
            .replace(/src="\//g, `src="${config.baseUrl}/`)
            .replace(/action="\//g, `action="${config.baseUrl}/`);

        const outputFilePath = path.join(config.outDir, page.output);
        const outputDir = path.dirname(outputFilePath);

        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        fs.writeFileSync(outputFilePath, fixedStr);
        console.log(`Generated: ${page.output}`);
    });
});

console.log('Build complete.');
