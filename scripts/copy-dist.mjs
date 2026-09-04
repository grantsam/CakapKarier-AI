import fs from 'fs';
import path from 'path';

const srcDir = path.resolve('WebApplication/frontend-react/dist');
const destDir = path.resolve('dist');

if (fs.existsSync(srcDir)) {
  fs.cpSync(srcDir, destDir, { recursive: true });
  console.log(`[Vercel Monorepo Build] Copied ${srcDir} -> ${destDir}`);
} else {
  console.warn(`[Vercel Monorepo Build] Source dist not found at ${srcDir}`);
}
