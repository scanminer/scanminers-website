// scripts/ensure-citations.js
const fs = require('fs');
const matter = require('gray-matter');

const filePaths = process.argv.slice(2);
let hasError = false;

console.log('Checking files for citation rules:', filePaths);

filePaths.forEach(filePath => {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter } = matter(fileContent);

    if (frontmatter.ai_generated === true) {
      if (!frontmatter.citations || frontmatter.citations.length === 0) {
        console.error(`❌ ERROR: AI-generated file '${filePath}' is missing the 'citations' field or it is empty.`);
        hasError = true;
      } else {
        console.log(`✅ OK: AI-generated file '${filePath}' has citations.`);
      }
    } else {
        console.log(`- INFO: File '${filePath}' is not AI-generated, skipping citation check.`);
    }
  } catch (error) {
    console.error(`❌ ERROR: Could not process file '${filePath}':`, error);
    hasError = true;
  }
});

if (hasError) {
  process.exit(1);
}
