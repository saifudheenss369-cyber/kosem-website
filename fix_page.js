const fs = require('fs');

const lines = fs.readFileSync('app/page.js', 'utf8').split('\n');
const fixedLines = [];
let i = 0;

while (i < lines.length) {
    if (lines[i].includes('{/* Hero Section: Main Offer Banners Carousel */}')) {
        fixedLines.push('                {/* Hero Section: Main Offer Banners Carousel */}');
        fixedLines.push('                {offerBanners.length > 0 ? (');
        fixedLines.push('                    <MainBannerCarousel banners={JSON.parse(JSON.stringify(offerBanners))} />');
        fixedLines.push('                ) : heroProducts.length > 0 ? (');
        fixedLines.push('                    <HeroCarousel products={JSON.parse(JSON.stringify(heroProducts))} />');
        fixedLines.push('                ) : (');
        fixedLines.push('                    <section style={{');
        fixedLines.push('                        position: \'relative\',');
        fixedLines.push('                        height: \'100vh\',');
        fixedLines.push('                        minHeight: \'600px\',');
        fixedLines.push('                        width: \'100%\',');
        fixedLines.push('                        display: \'flex\',');
        fixedLines.push('                        flexDirection: \'column\',');
        fixedLines.push('                        justifyContent: \'center\',');
        fixedLines.push('                        alignItems: \'center\',');
        fixedLines.push('                        textAlign: \'center\',');
        fixedLines.push('                        background: \'radial-gradient(circle at center, #1a1a1a 0%, #000 100%)\',');
        fixedLines.push('                        color: \'white\',');
        fixedLines.push('                        padding: \'2rem\'');
        fixedLines.push('                    }}>');
        fixedLines.push('                        <div style={{');
        fixedLines.push('                            zIndex: 2,');
        fixedLines.push('                            maxWidth: \'800px\',');
        fixedLines.push('                            animation: \'fadeIn 1.5s ease-out\'');
        fixedLines.push('                        }}>');
        fixedLines.push('                            <img');
        fixedLines.push('                                src="/logo.png"');
        fixedLines.push('                                alt="Kosem Logo"');
        fixedLines.push('                                style={{');
        fixedLines.push('                                    height: \'auto\',');
        fixedLines.push('                                    width: \'100%\',');
        fixedLines.push('                                    maxWidth: \'280px\',');
        fixedLines.push('                                    maxHeight: \'180px\',');
        fixedLines.push('                                    objectFit: \'contain\',');
        fixedLines.push('                                    marginBottom: \'1rem\',');
        fixedLines.push('                                    filter: \'drop-shadow(0 4px 10px rgba(0,0,0,0.3))\'');
        fixedLines.push('                                }}');
        fixedLines.push('                            />');
        fixedLines.push('                            <p style={{');
        fixedLines.push('                                fontSize: \'1.2rem\',');
        fixedLines.push('                                letterSpacing: \'4px\',');
        fixedLines.push('                                textTransform: \'uppercase\',');
        fixedLines.push('                                color: \'#d4af37\', // Gold');
        fixedLines.push('                                marginBottom: \'3rem\'');
        fixedLines.push('                            }}>');
        fixedLines.push('                                Premium Attar & Oudh');
        fixedLines.push('                            </p>');
        fixedLines.push('                            <Link href="/shop" style={{');
        fixedLines.push('                                padding: \'1rem 3rem\',');
        fixedLines.push('                                background: \'transparent\',');
        fixedLines.push('                                border: \'1px solid #d4af37\',');
        fixedLines.push('                                color: \'#d4af37\',');
        fixedLines.push('                                textDecoration: \'none\',');
        fixedLines.push('                                textTransform: \'uppercase\',');
        fixedLines.push('                                letterSpacing: \'2px\',');
        fixedLines.push('                                transition: \'all 0.3s ease\',');
        fixedLines.push('                                fontSize: \'0.9rem\'');
        fixedLines.push('                            }}');
        fixedLines.push('                                className="hover-btn"');
        fixedLines.push('                            >');
        fixedLines.push('                                Explore Collection');
        fixedLines.push('                            </Link>');
        fixedLines.push('                        </div>');
        fixedLines.push('');
        fixedLines.push('                        {/* Background Overlay */}');
        fixedLines.push('                        <div style={{');
        fixedLines.push('                            position: \'absolute\',');
        fixedLines.push('                            top: 0, left: 0, width: \'100%\', height: \'100%\',');
        fixedLines.push('                            background: \'url(/hero-bg-pattern.png) center/cover opacity 0.1\',');
        fixedLines.push('                            pointerEvents: \'none\'');
        fixedLines.push('                        }}></div>');
        fixedLines.push('                    </section>');
        fixedLines.push('                )}');

        // Skip lines until the Art of Refinement section
        while (!lines[i].includes('The Art of Refinement')) {
            i++;
        }
        // Step back slightly to include the container div
        i -= 2;

    } else {
        fixedLines.push(lines[i]);
        i++;
    }
}

fs.writeFileSync('app/page.js', fixedLines.join('\n'));
