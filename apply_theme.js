const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'app');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        const isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const replacements = [
    // Backgrounds
    { regex: /background:\s*['"]#(fff|ffffff)['"]/gi, replacement: "background: 'var(--color-bg-secondary)'" },
    { regex: /background:\s*['"]white['"]/gi, replacement: "background: 'var(--color-bg-secondary)'" },
    { regex: /background:\s*['"]#(f9f9f9|f5f5f5|f0f0f0|fafafa)['"]/gi, replacement: "background: 'var(--color-bg-secondary)'" },
    
    // Text Colors
    { regex: /color:\s*['"]#(333|333333|444|444444|000|000000)['"]/gi, replacement: "color: 'var(--color-text-main)'" },
    { regex: /color:\s*['"]black['"]/gi, replacement: "color: 'var(--color-text-main)'" },
    { regex: /color:\s*['"]#(555|555555|666|666666|888|888888|999|999999|aaa|aaaaaa|ccc|cccccc)['"]/gi, replacement: "color: 'var(--color-text-muted)'" },
    
    // Borders
    { regex: /border:\s*['"]1px solid #(ddd|dddddd|eee|eeeeee|ccc|cccccc)['"]/gi, replacement: "border: '1px solid var(--color-border)'" },
    { regex: /borderBottom:\s*['"]1px solid #(ddd|eee|ccc)['"]/gi, replacement: "borderBottom: '1px solid var(--color-border)'" },
    { regex: /borderTop:\s*['"]1px solid #(ddd|eee|ccc)['"]/gi, replacement: "borderTop: '1px solid var(--color-border)'" },

    // Gold normalization
    { regex: /['"]#(d4af37|c58c48|a06d35)['"]/gi, replacement: "'var(--color-gold)'" }
];

let filesModified = 0;

walkDir(targetDir, (filePath) => {
    if (!filePath.endsWith('.js') && !filePath.endsWith('.jsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf-8');
    let originalContent = content;

    replacements.forEach(({ regex, replacement }) => {
        content = content.replace(regex, replacement);
    });

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated: ${filePath}`);
        filesModified++;
    }
});

console.log(`\nTheme applied successfully. Modified ${filesModified} files.`);
