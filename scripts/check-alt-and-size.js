// scripts/check-alt-and-size.js
const fs = require('fs');
const path = require('path');
const globby = require('globby');
let fail = 0;

async function checkImages() {
    const mdxFiles = globby.sync(['content/**/*.mdx']);
    for (const file of mdxFiles) {
        const s = fs.readFileSync(file, 'utf8');
        const imgs = [...s.matchAll(/src:\s*["']([^"']+)["'][\s\S]*?alt:\s*["']([^"']+)["']/g)];
        for (const [, src, alt] of imgs) {
            if (!alt || alt.trim().length < 10) {
                console.error(`❌ ERROR: Alt text is too short or missing in ${file} for image ${src}`);
                fail++;
            }
            const p = path.join(process.cwd(), 'public', src.replace(/^\//, ''));
            if (fs.existsSync(p)) {
                const b = fs.statSync(p).size;
                if (b > 1_000_000) {
                    console.error(`❌ ERROR: Image is >1MB in ${file} for image ${src}`);
                    fail++;
                }
            }
        }
    }
    if (fail > 0) {
        process.exit(1);
    } else {
        console.log('✅ Image and alt-text checks passed.');
    }
}

checkImages();
