const fs = require('fs');

const lines = fs.readFileSync('app/page.js', 'utf8').split('\n');
const fixedLines = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 1. Add import
    if (line.includes('import MainBannerCarousel')) {
        fixedLines.push(line);
        fixedLines.push('import CategoryGrid from \'./components/CategoryGrid\';');
        continue;
    }

    // 2. Add Component before MovingCarousel
    if (line.includes('{/* Moving Carousel (Featured) */}')) {
        fixedLines.push('            {/* Shop by Category (Interactive Grid) */}');
        fixedLines.push('            <section style={{ background: \'#fafafa\', paddingTop: \'2rem\', paddingBottom: \'4rem\' }}>');
        fixedLines.push('                <div style={{ textAlign: \'center\', marginBottom: \'2rem\' }}>');
        fixedLines.push('                    <h2 style={{ fontFamily: \'var(--font-serif)\', fontSize: \'2.5rem\', color: \'#111\' }}>Shop by Category</h2>');
        fixedLines.push('                    <p style={{ color: \'#666\', marginTop: \'1rem\' }}>Discover our curated collections</p>');
        fixedLines.push('                </div>');
        fixedLines.push('                <div className="container">');
        fixedLines.push('                    <CategoryGrid activeCategory="All" onSelectCategory={() => {}} />');
        fixedLines.push('                </div>');
        fixedLines.push('            </section>');
        fixedLines.push('');
        fixedLines.push(line);
        continue;
    }

    fixedLines.push(line);
}

fs.writeFileSync('app/page.js', fixedLines.join('\n'));
