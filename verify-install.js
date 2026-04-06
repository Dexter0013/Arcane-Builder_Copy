#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function checkPackageJson() {
  const consumerPkgPath = path.resolve(__dirname, '../../../package.json');

  console.log(`\n🔍 Checking for package.json at: ${consumerPkgPath}\n`);

  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    if (fs.existsSync(consumerPkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(consumerPkgPath, 'utf8'));

      if (pkg.scripts && pkg.scripts.start && pkg.scripts.start.includes('arcane-builder-copy')) {
        console.log('✅ SUCCESS! package.json found and scripts added:\n');
        console.log('Scripts added:');
        console.log(`  - npm start: ${pkg.scripts.start}`);
        console.log(`  - npm dev: ${pkg.scripts.dev}`);
        console.log(`  - npm build: ${pkg.scripts.build}`);
        return true;
      } else {
        console.log('⚠️ package.json exists but scripts not yet added. Retrying...');
      }
    } else {
      console.log(`⏳ Attempt ${attempts + 1}/${maxAttempts}: Waiting for package.json...`);
    }

    attempts++;
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('❌ FAILED: package.json was not updated after 5 seconds');
  return false;
}

checkPackageJson().then(success => process.exit(success ? 0 : 1));
