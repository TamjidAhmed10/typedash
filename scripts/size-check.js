import fs from 'fs';
import { gzipSize } from 'gzip-size';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function checkSize() {
  const files = ['index.js', 'index.esm.js'];
  const sizes = await Promise.all(
    files.map(async (file) => {
      const filePath = join(__dirname, '../dist', file);
      const content = fs.readFileSync(filePath);
      const rawSize = content.length;
      const gzippedSize = await gzipSize(content);

      return {
        file,
        rawSize: (rawSize / 1024).toFixed(2),
        gzippedSize: (gzippedSize / 1024).toFixed(2),
      };
    })
  );

  console.log('\nBundle Sizes:\n');
  sizes.forEach(({ file, rawSize, gzippedSize }) => {
    console.log(`📦 ${file}`);
    console.log(`   Raw Size: ${rawSize} KB`);
    console.log(`   Gzipped: ${gzippedSize} KB\n`);
  });
}

checkSize().catch(console.error);
