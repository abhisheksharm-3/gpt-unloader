import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const packageJsonPath = path.join(rootDir, 'package.json');
const manifestPath = path.join(rootDir, 'public', 'manifest.json');

const args = process.argv.slice(2);
const bumpType = args[0] || 'patch';

function bumpVersion(version, type) {
    const [major, minor, patch] = version.split('.').map(Number);

    switch (type) {
        case 'major':
            return `${major + 1}.0.0`;
        case 'minor':
            return `${major}.${minor + 1}.0`;
        case 'patch':
        default:
            return `${major}.${minor}.${patch + 1}`;
    }
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const oldVersion = packageJson.version;
const newVersion = bumpVersion(oldVersion, bumpType);

packageJson.version = newVersion;
manifest.version = newVersion;

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 4) + '\n');

console.log(`Version bumped: ${oldVersion} → ${newVersion}`);
console.log(`\nTo release:\n  git add .\n  git commit -m "Release v${newVersion}"\n  git tag v${newVersion}\n  git push origin main --tags`);
