// generate-pwa-icons.js - Generate PWA icons from base SVG
// Creates all required PWA icon sizes for different devices

const fs = require('fs');
const path = require('path');

// Create simple PWA icons using CSS/HTML canvas approach
// This is a placeholder - in production, you'd use proper image processing

const iconSizes = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 96, name: 'shortcut-timer.png' },
  { size: 96, name: 'shortcut-cards.png' },
  { size: 96, name: 'shortcut-journal.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 16, name: 'favicon-16x16.png' }
];

// SVG icon template for Tarot Timer
const createTarotIcon = (size, type = 'main') => {
  const colors = {
    main: { primary: '#7b2cbf', secondary: '#f4d03f', background: '#1a1625' },
    timer: { primary: '#7b2cbf', secondary: '#f4d03f', accent: '#ff6b6b' },
    cards: { primary: '#7b2cbf', secondary: '#f4d03f', accent: '#4ecdc4' },
    journal: { primary: '#7b2cbf', secondary: '#f4d03f', accent: '#45b7d1' }
  };

  const color = colors[type] || colors.main;

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color.background};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color.primary};stop-opacity:1" />
        </linearGradient>
        <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color.secondary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color.accent || color.primary};stop-opacity:1" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <!-- Background -->
      <rect width="${size}" height="${size}" fill="url(#bg-gradient)" rx="${size * 0.15}" />

      <!-- Mystical border -->
      <rect x="${size * 0.05}" y="${size * 0.05}"
            width="${size * 0.9}" height="${size * 0.9}"
            fill="none" stroke="${color.secondary}" stroke-width="${size * 0.01}"
            rx="${size * 0.12}" opacity="0.6"/>

      ${getIconContent(size, type, color)}

      <!-- Mystical sparkles -->
      <circle cx="${size * 0.2}" cy="${size * 0.25}" r="${size * 0.015}" fill="${color.secondary}" opacity="0.8"/>
      <circle cx="${size * 0.8}" cy="${size * 0.3}" r="${size * 0.01}" fill="${color.secondary}" opacity="0.6"/>
      <circle cx="${size * 0.75}" cy="${size * 0.8}" r="${size * 0.012}" fill="${color.secondary}" opacity="0.7"/>
      <circle cx="${size * 0.25}" cy="${size * 0.75}" r="${size * 0.008}" fill="${color.secondary}" opacity="0.9"/>
    </svg>
  `;
};

function getIconContent(size, type, color) {
  const centerX = size / 2;
  const centerY = size / 2;
  const iconSize = size * 0.4;

  switch (type) {
    case 'timer':
      return `
        <!-- Timer icon -->
        <circle cx="${centerX}" cy="${centerY}" r="${iconSize * 0.4}"
                fill="none" stroke="url(#icon-gradient)" stroke-width="${size * 0.03}" filter="url(#glow)"/>
        <line x1="${centerX}" y1="${centerY}" x2="${centerX}" y2="${centerY - iconSize * 0.3}"
              stroke="url(#icon-gradient)" stroke-width="${size * 0.02}" stroke-linecap="round"/>
        <line x1="${centerX}" y1="${centerY}" x2="${centerX + iconSize * 0.2}" y2="${centerY - iconSize * 0.1}"
              stroke="url(#icon-gradient)" stroke-width="${size * 0.015}" stroke-linecap="round"/>
      `;

    case 'cards':
      return `
        <!-- Cards icon -->
        <rect x="${centerX - iconSize * 0.3}" y="${centerY - iconSize * 0.4}"
              width="${iconSize * 0.4}" height="${iconSize * 0.6}"
              fill="url(#icon-gradient)" rx="${size * 0.02}" transform="rotate(-15 ${centerX} ${centerY})" filter="url(#glow)"/>
        <rect x="${centerX - iconSize * 0.1}" y="${centerY - iconSize * 0.4}"
              width="${iconSize * 0.4}" height="${iconSize * 0.6}"
              fill="url(#icon-gradient)" rx="${size * 0.02}" transform="rotate(15 ${centerX} ${centerY})" filter="url(#glow)"/>
      `;

    case 'journal':
      return `
        <!-- Journal icon -->
        <rect x="${centerX - iconSize * 0.25}" y="${centerY - iconSize * 0.35}"
              width="${iconSize * 0.5}" height="${iconSize * 0.7}"
              fill="url(#icon-gradient)" rx="${size * 0.02}" filter="url(#glow)"/>
        <line x1="${centerX - iconSize * 0.15}" y1="${centerY - iconSize * 0.15}"
              x2="${centerX + iconSize * 0.15}" y2="${centerY - iconSize * 0.15}"
              stroke="${color.background}" stroke-width="${size * 0.015}" stroke-linecap="round"/>
        <line x1="${centerX - iconSize * 0.15}" y1="${centerY}"
              x2="${centerX + iconSize * 0.15}" y2="${centerY}"
              stroke="${color.background}" stroke-width="${size * 0.015}" stroke-linecap="round"/>
        <line x1="${centerX - iconSize * 0.15}" y1="${centerY + iconSize * 0.15}"
              x2="${centerX + iconSize * 0.15}" y2="${centerY + iconSize * 0.15}"
              stroke="${color.background}" stroke-width="${size * 0.015}" stroke-linecap="round"/>
      `;

    default:
      return `
        <!-- Main Tarot symbol -->
        <circle cx="${centerX}" cy="${centerY}" r="${iconSize * 0.35}"
                fill="none" stroke="url(#icon-gradient)" stroke-width="${size * 0.025}" filter="url(#glow)"/>
        <polygon points="${centerX},${centerY - iconSize * 0.2} ${centerX - iconSize * 0.15},${centerY + iconSize * 0.1} ${centerX + iconSize * 0.15},${centerY + iconSize * 0.1}"
                 fill="url(#icon-gradient)" filter="url(#glow)"/>
        <circle cx="${centerX}" cy="${centerY + iconSize * 0.25}" r="${size * 0.02}" fill="${color.secondary}"/>
      `;
  }
}

// Generate icons
console.log('🎨 Generating PWA icons...');

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate main icons
iconSizes.forEach(({ size, name }) => {
  let iconType = 'main';

  if (name.includes('timer')) iconType = 'timer';
  else if (name.includes('cards')) iconType = 'cards';
  else if (name.includes('journal')) iconType = 'journal';

  const svgContent = createTarotIcon(size, iconType);
  const svgPath = path.join(publicDir, name.replace('.png', '.svg'));

  fs.writeFileSync(svgPath, svgContent);
  console.log(`✨ Generated ${name} (${size}x${size}) as SVG`);
});

// Create HTML template for PNG conversion
const conversionHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>PWA Icon Generator</title>
  <style>
    body { margin: 0; padding: 20px; background: #f0f0f0; font-family: Arial, sans-serif; }
    .icon-container { display: inline-block; margin: 10px; text-align: center; }
    .icon-container img { border: 1px solid #ddd; border-radius: 8px; }
    .icon-info { margin-top: 5px; font-size: 12px; color: #666; }
    .download-info { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <h1>🔮 Tarot Timer PWA Icons</h1>
  <div class="download-info">
    <p><strong>Manual PNG Generation Required:</strong></p>
    <p>1. Right-click each SVG icon below and "Save image as..." to save as PNG</p>
    <p>2. Rename files according to the labels</p>
    <p>3. These icons will be used for the PWA installation</p>
  </div>

  ${iconSizes.map(({ size, name }) => {
    const svgName = name.replace('.png', '.svg');
    return `
      <div class="icon-container">
        <img src="${svgName}" width="${Math.min(size, 200)}" height="${Math.min(size, 200)}" alt="${name}">
        <div class="icon-info">${name}<br>${size}x${size}</div>
      </div>
    `;
  }).join('')}

  <div style="margin-top: 40px; padding: 20px; background: #fff3e0; border-radius: 8px;">
    <h3>📱 Installation Instructions:</h3>
    <ol>
      <li>Generate PNG files from the SVGs above</li>
      <li>Place all PNG files in the <code>/public</code> directory</li>
      <li>The PWA will automatically use these icons for installation</li>
      <li>Test installation on mobile devices and desktop browsers</li>
    </ol>
  </div>
</body>
</html>
`;

fs.writeFileSync(path.join(publicDir, 'pwa-icons.html'), conversionHTML);

console.log('🎯 PWA icons generated successfully!');
console.log(`📂 Files created in: ${publicDir}`);
console.log('🌐 Open public/pwa-icons.html in your browser to download PNG versions');
console.log('💡 Manual PNG conversion required for optimal quality');

// Generate favicon.ico placeholder
const faviconSVG = createTarotIcon(32, 'main');
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSVG);
console.log('✅ Favicon SVG created');