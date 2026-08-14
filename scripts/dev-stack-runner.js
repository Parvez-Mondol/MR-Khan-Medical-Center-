#!/usr/bin/env node
const { spawnSync } = require('child_process');
const path = require('path');

const isWin = process.platform === 'win32';
const repoRoot = path.resolve(__dirname, '..');
const psScript = path.join(repoRoot, 'scripts', 'dev-up.ps1');
const shScript = path.join(repoRoot, 'scripts', 'dev-up.sh');

const scriptPath = isWin ? psScript : shScript;

if (process.argv.includes('--dry-run') || process.env.DRY_RUN) {
  console.log(`Selected helper: ${scriptPath}`);
  process.exit(0);
}

if (isWin) {
  const args = ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptPath];
  const res = spawnSync('powershell.exe', args, { stdio: 'inherit' });
  process.exit(res.status);
} else {
  const res = spawnSync('sh', [scriptPath], { stdio: 'inherit' });
  process.exit(res.status);
}
