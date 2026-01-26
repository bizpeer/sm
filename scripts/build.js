const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const config = {
    baseUrl: '/sm', // GitHub Pages repository name
    outDir: path.join(__dirname, '../dist')
};

const viewsDir = path.join(__dirname, '../views');

// Ensure outDir exists
if (fs.existsSync(config.outDir)) {
    fs.rmSync(config.outDir, { recursive: true, force: true });
}
fs.mkdirSync(config.outDir, { recursive: true });

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
if (fs.existsSync(path.join(__dirname, '../public'))) {
    copyRecursiveSync(path.join(__dirname, '../public'), config.outDir);
}

// 2. Render EJS files
const pages = [
    { template: 'index.ejs', output: 'index.html', data: {} },
    { template: 'inquiry.ejs', output: 'inquiry.html', data: { product: '' } },
    { template: 'admin/login.ejs', output: 'admin/index.html', data: {} },
    {
        template: 'admin/dashboard.ejs', output: 'admin/dashboard.html', data: {
            inquiries: [
                { id: 1, date: new Date(), name: '홍길동', contact: '010-1234-5678', message: '자연석 대리석 문의드립니다.', product: 'Stone-1' }
            ]
        }
    }
];

const renderAll = async () => {
    for (const page of pages) {
        const templatePath = path.join(viewsDir, page.template);
        try {
            const str = await ejs.renderFile(templatePath, {
                ...page.data,
                baseUrl: config.baseUrl
            });

            // Fix asset paths: /css -> /sm/css, /images -> /sm/images, etc.
            // We use a regex that looks for / preceded by " or '
            const fixedStr = str.replace(/(href|src|action)=["']\/([^"']*)["']/g, (match, p1, p2) => {
                return `${p1}="${config.baseUrl}/${p2}"`;
            });

            const outputFilePath = path.join(config.outDir, page.output);
            const outputDir = path.dirname(outputFilePath);

            if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

            fs.writeFileSync(outputFilePath, fixedStr);
            console.log(`Generated: ${page.output}`);
        } catch (err) {
            console.error(`Error rendering ${page.template}:`, err);
            process.exit(1); // Fail the build
        }
    }
    console.log('Build complete.');
};

renderAll();
