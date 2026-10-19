import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Regex patterns to match violations
const patterns = [
    {
        name: 'Nilai hex mentah',
        regex: /#[0-9a-fA-F]{3,8}\b/,
    },
    {
        name: 'Warna mentah',
        regex: /rgba?\(/,
    },
    {
        name: 'Nilai arbitrer Tailwind',
        regex: /\b(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|space-[xy]|w|h|text|rounded)-\[[^\]]+\]/,
    },
    {
        name: 'Gaya inline untuk properti bertoken',
        regex: /style=\{\{[^}]*(?:color|margin|padding|fontSize)/,
    }
];

// Directories to scan
const scanDirs = [
    path.join(rootDir, 'resources', 'js'),
    path.join(rootDir, 'resources', 'css')
];

// File extensions to scan
const extensions = ['.ts', '.tsx', '.css'];
// Exception file
const tokenFile = path.join(rootDir, 'resources', 'css', 'tokens.css');

let violationsFound = false;

function scanDirectory(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            scanDirectory(fullPath);
        } else if (stat.isFile() && extensions.includes(path.extname(fullPath))) {
            if (fullPath !== tokenFile) {
                checkFile(fullPath);
            }
        }
    }
}

function checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        for (const pattern of patterns) {
            if (pattern.regex.test(line)) {
                console.error(`Pelanggaran "${pattern.name}" ditemukan di:`);
                console.error(`File: ${filePath}:${i + 1}`);
                console.error(`Kode: ${line.trim()}`);
                console.error('---');
                violationsFound = true;
            }
        }
    }
}

console.log('Mulai pemindaian linting token...');

scanDirs.forEach(dir => scanDirectory(dir));

if (violationsFound) {
    console.error('Linting gagal. Terdapat pelanggaran token desain.');
    process.exit(1);
} else {
    console.log('Linting berhasil. Tidak ditemukan pelanggaran token desain.');
    process.exit(0);
}
