// scripts/semantic-qa.js
const fs = require('fs');
const globby = require('globby');

const TECH_REQUIRED = [/sar|sentinel-1|polsar|insar/i, /hyperspectral|hsi|enmap|prisma/i, /multispectral|msi|sentinel-2|landsat/i];
const FEATURE_HINTS = [/ndvi|ndmi|mndwi|ndsi|pcii|pca|savi|gndvi|bsi|slope|aspect|glcm|texture/i, /band\s*(ratio|math|index)/i];
const QUANT_REQUIRED = [/(\b\d{1,3}(\.\d+)?\s?%)/, /\b(rmse|mae|auc|f1|precision|recall)\b/i, /\b(m|km|ha|km2|m2)\b/];
const ALLOWED_SOURCES = [/nasa\.gov/i, /esa\.int/i, /usgs\.gov/i, /copernicus|sentinel/i, /doi\.org/i, /agu\.org/i, /springer|elsevier|wiley|mdpi/i, /onepetro\.org/i, /geoscience/i];
const BANNED_WORDS = /\b(revolutionary|game-?changing|unprecedented|breakthrough|magic)\b/i;

const files = globby.sync(['content/insights/**/*.mdx', 'content/case-studies/**/*.mdx']);
let errors = 0;

for (const f of files) {
    const s = fs.readFileSync(f, 'utf8');
    const needsTech = TECH_REQUIRED.some(r => r.test(s));
    if (needsTech && !FEATURE_HINTS.some(r => r.test(s))) {
        console.error(`❌ ERROR: Missing feature details (indices/textures) in ${f}`);
        errors++;
    }
    const claims = s.match(/(Why It Matters|Results|Methods & Models)[\s\S]+?(\n##|$)/gi) || [];
    for (const c of claims) {
        const hasQuant = QUANT_REQUIRED.some(r => r.test(c));
        if (!hasQuant) {
            console.error(`❌ ERROR: Quantitative backing missing in a claims section: ${f}`);
            errors++;
            break;
        }
    }
    const urls = s.match(/\bhttps?:\/\/[^\s)\]]+/g) || [];
    for (const u of urls) {
        const ok = ALLOWED_SOURCES.some(r => r.test(u));
        if (!ok) {
            console.error(`❌ ERROR: Suspicious source domain: ${u} in ${f}`);
            errors++;
        }
    }
    if (BANNED_WORDS.test(s)) {
        console.error(`❌ ERROR: Banned hype wording found in ${f}`);
        errors++;
    }
}
process.exit(errors ? 1 : 0);
