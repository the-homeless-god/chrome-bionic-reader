const fs = require('fs-extra');
const path = require('path');

async function copyPublicFiles() {
  const publicDir = path.resolve(__dirname, '../public');
  const distDir = path.resolve(__dirname, '../dist');

  try {
    await fs.copy(publicDir, distDir, {
      filter: (src) => {
        const fileName = path.basename(src);
        return !fileName.startsWith('.');
      }
    });
    console.log('Static files copied successfully');
  } catch (err) {
    console.error('Error copying static files:', err);
    process.exit(1);
  }
}

copyPublicFiles(); 
