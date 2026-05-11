const fs = require('fs');

const lines = fs.readFileSync('app/page.js', 'utf8').split('\n');
const fixedLines = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Line 159 previously had: <div style={{ maxWidth: '800px', margin: '0 auto' }}>
    // We need to wrap it in another div representing the white section
    if (line.includes('<div style={{ maxWidth: \'800px\', margin: \'0 auto\' }}>')) {
        fixedLines.push('                <div style={{ background: \'#fff\', padding: \'4rem 2rem\', textAlign: \'center\' }}>');
        fixedLines.push(line);
    } else {
        fixedLines.push(line);
    }
}

fs.writeFileSync('app/page.js', fixedLines.join('\n'));
