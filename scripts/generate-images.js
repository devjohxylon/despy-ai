import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const sizes = {
  favicon: [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 180, name: 'apple-touch-icon.png' },
    { size: 192, name: 'android-chrome-192x192.png' },
    { size: 512, name: 'android-chrome-512x512.png' }
  ],
  og: [
    { width: 1200, height: 630, name: 'og-image.png' }
  ]
};

async function generateImages() {
  try {
    // Read SVG files
    const faviconSvg = await fs.readFile('public/favicon.svg');
    const ogSvg = await fs.readFile('public/og-image.svg');

    // Generate favicons
    for (const { size, name } of sizes.favicon) {
      await sharp(faviconSvg)
        .resize(size, size)
        .png()
        .toFile(`public/${name}`);
      console.log(`Generated ${name}`);
    }

    // Generate OG image
    for (const { width, height, name } of sizes.og) {
      await sharp(ogSvg)
        .resize(width, height)
        .png()
        .toFile(`public/${name}`);
      console.log(`Generated ${name}`);
    }

    console.log('All images generated successfully!');
  } catch (error) {
    console.error('Error generating images:', error);
  }
}

generateImages(); 