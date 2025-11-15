// Generate placeholder mineral images with colored gradients
// This creates simple SVG placeholders for the mineral image system

const fs = require('fs');
const path = require('path');

const mineralsDir = path.join(__dirname, '../public/minerals');

// Mineral color schemes (designed for dark mode)
const mineralColors = {
  gold: { from: '#D4AF37', to: '#FFD700', accent: '#B8860B' },
  copper: { from: '#B87333', to: '#D2691E', accent: '#8B4513' },
  nickel: { from: '#727472', to: '#B0B3B0', accent: '#4A4A4A' },
  lithium: { from: '#E5E5E5', to: '#F8F8F8', accent: '#CCCCCC' },
  cobalt: { from: '#0047AB', to: '#4169E1', accent: '#003366' },
  'rare-earth': { from: '#8B4789', to: '#9370DB', accent: '#663399' },
  titanium: { from: '#878681', to: '#C0C0C0', accent: '#696969' },
  manganese: { from: '#9C7C6C', to: '#8B7355', accent: '#654321' },
  chromium: { from: '#A8A8A8', to: '#DCDCDC', accent: '#808080' },
  zinc: { from: '#7A7A7A', to: '#A8A8A8', accent: '#5A5A5A' },
  aluminum: { from: '#A8A8A8', to: '#E5E4E2', accent: '#848482' },
  graphite: { from: '#383838', to: '#5A5A5A', accent: '#1C1C1C' },
  silicon: { from: '#3C3C3C', to: '#696969', accent: '#2F2F2F' },
  tungsten: { from: '#5A5A5A', to: '#808080', accent: '#3F3F3F' },
  vanadium: { from: '#6B7B8C', to: '#8B9BB0', accent: '#4A5A6B' },
  zirconium: { from: '#E8D4B0', to: '#F5DEB3', accent: '#D2B48C' },
  gallium: { from: '#C0C0C0', to: '#E8E8E8', accent: '#A0A0A0' },
  pgm: { from: '#E5E4E2', to: '#FFFFFF', accent: '#C9C9C9' },
  default: { from: '#4A5568', to: '#718096', accent: '#2D3748' }
};

function generateSVG(name, colors) {
  const width = 1600;
  const height = 900;
  
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad-${name}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.from};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${colors.accent};stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:${colors.to};stop-opacity:1" />
    </linearGradient>
    <radialGradient id="glow-${name}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:${colors.accent};stop-opacity:0.3" />
      <stop offset="100%" style="stop-color:${colors.from};stop-opacity:0" />
    </radialGradient>
    <pattern id="grain-${name}" patternUnits="userSpaceOnUse" width="100" height="100">
      <rect width="100" height="100" fill="url(#grad-${name})"/>
      <circle cx="10" cy="10" r="1.5" fill="${colors.accent}" opacity="0.3"/>
      <circle cx="45" cy="25" r="1" fill="${colors.to}" opacity="0.2"/>
      <circle cx="75" cy="50" r="1.2" fill="${colors.from}" opacity="0.25"/>
      <circle cx="30" cy="70" r="0.8" fill="${colors.accent}" opacity="0.2"/>
      <circle cx="90" cy="85" r="1.3" fill="${colors.to}" opacity="0.3"/>
    </pattern>
  </defs>
  
  <!-- Base gradient -->
  <rect width="${width}" height="${height}" fill="url(#grad-${name})"/>
  
  <!-- Glow overlay -->
  <rect width="${width}" height="${height}" fill="url(#glow-${name})"/>
  
  <!-- Grain texture -->
  <rect width="${width}" height="${height}" fill="url(#grain-${name})" opacity="0.4"/>
  
  <!-- Subtle vignette -->
  <rect width="${width}" height="${height}" fill="radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.3) 100%)" opacity="0.5"/>
</svg>`;
}

// Ensure directory exists
if (!fs.existsSync(mineralsDir)) {
  fs.mkdirSync(mineralsDir, { recursive: true });
}

// Generate all mineral images
Object.entries(mineralColors).forEach(([name, colors]) => {
  const svg = generateSVG(name, colors);
  // For now, save as SVG (can convert to JPG later with imagemagick/sharp if needed)
  const svgFilename = path.join(mineralsDir, `${name}.svg`);
  fs.writeFileSync(svgFilename, svg);
  console.log(`✓ Generated ${name}.svg`);
});

console.log('\n✅ All mineral placeholder images generated!');
console.log('📁 Location: public/minerals/');
console.log('\n💡 Note: These are SVG placeholders. For production, consider:');
console.log('   - Converting to optimized JPG/WebP');
console.log('   - Using Stability AI to generate realistic mineral textures');
console.log('   - Sourcing high-quality geological photography');
