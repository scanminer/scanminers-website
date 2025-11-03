// scripts/required-sections.js (CJS)
const fs = require('fs');

function checkFile(filePath) {
  const s = fs.readFileSync(filePath, 'utf8');
  const must = [
    '## TL;DR',
    'Executive Summary',
    'Why continuous monitoring',
    'How LiDAR works',
    'Operations Playbook',
    'Case Evidence',
    'Systems Integration',
    'Costs', // allow broader match for Costs/Risks/Limitations
    'Future Trends',
    'Actionable Recommendations',
    'Conclusion'
  ];
  const missing = must.filter((h) => !s.includes(h));
  if (missing.length) {
    console.error(`❌ Missing sections in ${filePath}:`, missing);
    return 1;
  }
  console.log(`✅ Sections OK: ${filePath}`);
  return 0;
}

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('No files provided. Usage: node scripts/required-sections.js <file1.mdx> [file2.mdx] ...');
  process.exit(1);
}

let exit = 0;
for (const f of files) exit |= checkFile(f);
process.exit(exit);
