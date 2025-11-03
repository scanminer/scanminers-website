// scripts/ensure-citations.js (CJS) — enforce allowed inline citations and presence for AI-generated files
const fs = require('fs');
const matter = require('gray-matter');

const allowed = new Set([
  'Beeroon, 2024',
  'Stanley et al., 2023',
  'SME, 2023',
  'CDC Stacks, 2023',
  'Dataintelo, 2024',
  'Growth Market Reports, 2024',
]);

function checkFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data: frontmatter, content } = matter(fileContent);
  let bad = [];

  // Enforce citations presence for AI generated
  if (frontmatter.ai_generated === true) {
    if (!frontmatter.citations || frontmatter.citations.length === 0) {
      console.error(`❌ ${filePath}: missing frontmatter 'citations' for AI-generated content.`);
      return 1;
    }
  }

  // Collect inline bracket citations like [Author, YYYY]
  const cites = [...content.matchAll(/\[([^\]]+?,\s*\d{4})\]/g)].map((m) => m[1]);
  for (const c of cites) {
    if (!allowed.has(c)) bad.push(c);
  }
  if (bad.length) {
    console.error(`❌ ${filePath}: disallowed inline citations:`, Array.from(new Set(bad)));
    return 1;
  }
  console.log(`✅ Citations OK: ${filePath}`);
  return 0;
}

const filePaths = process.argv.slice(2);
if (filePaths.length === 0) {
  console.error('No files provided. Usage: node scripts/ensure-citations.js <file1.mdx> [file2.mdx] ...');
  process.exit(1);
}

let exit = 0;
for (const p of filePaths) exit |= checkFile(p);
process.exit(exit);
