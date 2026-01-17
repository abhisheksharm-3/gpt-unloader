import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

// Read version from manifest
const manifest = JSON.parse(fs.readFileSync(path.join(distDir, 'manifest.json'), 'utf8'));
const version = manifest.version;

// Create zip file
const zipName = `gpt-unloader-v${version}.zip`;
const zipPath = path.resolve(rootDir, zipName);

console.log(`Creating ${zipName}...`);

// Use PowerShell to create zip on Windows
try {
    execSync(`powershell Compress-Archive -Path "${distDir}/*" -DestinationPath "${zipPath}" -Force`, {
        cwd: rootDir,
        stdio: 'inherit'
    });
    console.log(`Created ${zipName}`);
} catch (error) {
    console.error('Failed to create zip:', error.message);
    process.exit(1);
}
