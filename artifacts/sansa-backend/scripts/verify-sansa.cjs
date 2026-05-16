#!/usr/bin/env node
/**
 * Syntax-only checks before deploy (no server start, no DB).
 * Run from package root: npm run verify
 *
 * Checks: index.cjs, every .js under src/, and every .js under public/ (recursively).
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');

const files = [];
const seen = new Set();

function addFile(absPath) {
  const norm = path.resolve(absPath);
  if (seen.has(norm)) return;
  seen.add(norm);
  files.push(norm);
}

function walkJs(dir) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name.startsWith('.')) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkJs(p);
    else if (ent.name.endsWith('.js')) addFile(p);
  }
}

addFile(path.join(root, 'index.cjs'));
walkJs(path.join(root, 'src'));
walkJs(path.join(root, 'public'));

let failed = false;
for (const f of files) {
  try {
    execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' });
  } catch {
    console.error('Syntax error:', path.relative(root, f));
    failed = true;
  }
}

if (failed) process.exit(1);
console.log(`SANSA verify: ${files.length} JavaScript files passed node --check.`);
