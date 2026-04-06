#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Navigate up from setup.js to consumer root: @slothslasher/arcane-builder-copy/setup.js -> ../../../
const consumerPkgPath = path.resolve(__dirname, '../../../package.json');

try {
  if (fs.existsSync(consumerPkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(consumerPkgPath, 'utf8'));
    pkg.scripts = pkg.scripts || {};
    pkg.scripts.start = 'serve node_modules/@slothslasher/arcane-builder-copy/dist -l 3000';
    pkg.scripts.dev = 'serve node_modules/@slothslasher/arcane-builder-copy/dist -l 3000';
    pkg.scripts.build = "echo 'Game is pre-built and ready to deploy'";
    fs.writeFileSync(consumerPkgPath, JSON.stringify(pkg, null, 2) + '\n');
    console.log('✅ Arcane Builder installed! Run: npm start');
  } else {
    console.warn('⚠️ Consumer package.json not found at:', consumerPkgPath);
  }
} catch (e) {
  console.error('⚠️ Setup error:', e.message);
}



