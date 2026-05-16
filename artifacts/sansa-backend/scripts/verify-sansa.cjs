#!/usr/bin/env node
/**
 * Syntax-only checks before deploy (no server start, no DB).
 * Run from package root: npm run verify
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');

function walkJs(dir, acc) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name.startsWith('.')) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkJs(p, acc);
    else if (ent.name.endsWith('.js')) acc.push(p);
  }
}

const files = [path.join(root, 'index.cjs')];
walkJs(path.join(root, 'src'), files);
for (const name of ['app.js', 'page-shell.js', 'page-workspace-mvp.js', 'admin-test.js', 'sw.js']) {
  const p = path.join(root, 'public', name);
  if (fs.existsSync(p)) files.push(p);
}

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
