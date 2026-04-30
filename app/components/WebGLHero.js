'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

export default function WebGLHero({ image = '/hero-box.jpg', title = 'Kosem', subtitle = 'Premium Attar & Oudh', link = '/shop' }) {
    const canvasRef = useRef(null);
    const rendererRef = useRef(null);
    const frameRef = useRef(null);

    useEffect(() => {
        let THREE;
        let mounted = true;

        async function init() {
            THREE = await import('three');

            const canvas = canvasRef.current;
            if (!canvas || !mounted) return;

            // ── Scene ──────────────────────────────────────────────────
            const scene = new THREE.Scene();
            scene.fog = new THREE.FogExp2(0x000000, 0.035);

            // ── Camera ─────────────────────────────────────────────────
            const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
            camera.position.set(0, 0, 4.5);

            // ── Renderer ───────────────────────────────────────────────
            const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.setSize(canvas.clientWidth, canvas.clientHeight);
            renderer.outputColorSpace = THREE.SRGBColorSpace;
            rendererRef.current = renderer;

            // ── Lights ─────────────────────────────────────────────────
            const ambient = new THREE.AmbientLight(0xffffff, 0.4);
            scene.add(ambient);

            const goldLight = new THREE.PointLight(0xd4af37, 3, 12);
            goldLight.position.set(2, 2, 3);
            scene.add(goldLight);

            const rimLight = new THREE.PointLight(0xffffff, 1.2, 15);
            rimLight.position.set(-3, -1, 2);
            scene.add(rimLight);

            // ── Image Plane ────────────────────────────────────────────
            const loader = new THREE.TextureLoader();
            const texture = await new Promise(resolve => loader.load(image, resolve));
            texture.colorSpace = THREE.SRGBColorSpace;

            // Aspect-correct plane (portrait image ~ 4:5)
            const imgAspect = texture.image.width / texture.image.height;
            const planeH = 3.2;
            const planeW = planeH * imgAspect;
            const planeGeo = new THREE.PlaneGeometry(planeW, planeH, 32, 32);
            const planeMat = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.35,
                metalness: 0.1,
            });
            const plane = new THREE.Mesh(planeGeo, planeMat);
            plane.rotation.y = -0.18;
            scene.add(plane);

            // ── Gold Particles ─────────────────────────────────────────
            const COUNT = 2200;
            const positions = new Float32Array(COUNT * 3);
            const sizes = new Float32Array(COUNT);
            for (let i = 0; i < COUNT; i++) {
                positions[i * 3]     = (Math.random() - 0.5) * 18;
                positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
                sizes[i] = Math.random() * 4 + 1;
            }
            const partGeo = new THREE.BufferGeometry();
            partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            partGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

            const partMat = new THREE.PointsMaterial({
                color: 0xd4af37,
                size: 0.04,
                sizeAttenuation: true,
                transparent: true,
                opacity: 0.55,
                depthWrite: false,
            });
            const particles = new THREE.Points(partGeo, partMat);
            scene.add(particles);

            // ── Resize ─────────────────────────────────────────────────
            const onResize = () => {
                if (!canvas || !mounted) return;
                const w = canvas.clientWidth;
                const h = canvas.clientHeight;
                camera.aspect = w / h;
                camera.updateProjectionMatrix();
                renderer.setSize(w, h);
            };
            window.addEventListener('resize', onResize);

            // ── Scroll ─────────────────────────────────────────────────
            let scrollY = 0;
            const onScroll = () => { scrollY = window.scrollY; };
            window.addEventListener('scroll', onScroll, { passive: true });

            // ── Animate ────────────────────────────────────────────────
            let t = 0;
            const animate = () => {
                if (!mounted) return;
                frameRef.current = requestAnimationFrame(animate);
                t += 0.008;

                // floating bob
                plane.position.y = Math.sin(t * 0.9) * 0.08;
                plane.rotation.x = Math.sin(t * 0.6) * 0.015;

                // scroll: camera pulls back + tilts
                const prog = Math.min(1, scrollY / window.innerHeight);
                camera.position.z = 4.5 + prog * 4;
                camera.rotation.x = prog * -0.25;
                plane.rotation.y = -0.18 + prog * 0.5;

                // gold light pulse
                goldLight.intensity = 3 + Math.sin(t * 1.4) * 0.8;

                // slowly drift particles
                particles.rotation.y = t * 0.04;
                particles.rotation.x = t * 0.015;

                renderer.render(scene, camera);
            };
            animate();

            // Cleanup returned
            return () => {
                mounted = false;
                cancelAnimationFrame(frameRef.current);
                window.removeEventListener('resize', onResize);
                window.removeEventListener('scroll', onScroll);
                renderer.dispose();
                planeMat.dispose();
                planeGeo.dispose();
                partGeo.dispose();
                partMat.dispose();
                texture.dispose();
            };
        }

        let cleanup;
        init().then(fn => { cleanup = fn; });

        return () => {
            mounted = false;
            cancelAnimationFrame(frameRef.current);
            cleanup?.();
        };
    }, [image]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh', background: '#000', overflow: 'hidden' }}>
            {/* Three.js canvas */}
            <canvas
                ref={canvasRef}
                style={{ display: 'block', width: '100%', height: '100%' }}
            />

            {/* Text overlay */}
            <div style={{
                position: 'absolute',
                bottom: '12%',
                left: '6%',
                color: 'white',
                zIndex: 2,
                animation: 'wglFadeUp 1.4s cubic-bezier(0.22,1,0.36,1) 0.6s backwards',
            }}>
                <p style={{
                    fontSize: '0.75rem',
                    letterSpacing: '5px',
                    textTransform: 'uppercase',
                    color: 'var(--color-gold)',
                    marginBottom: '0.6rem',
                }}>Premium Collection</p>
                <h1 style={{
                    fontSize: 'clamp(2.4rem, 6vw, 5rem)',
                    fontFamily: 'var(--font-serif)',
                    marginBottom: '0.5rem',
                    textShadow: '0 4px 30px rgba(0,0,0,0.7)',
                    letterSpacing: '2px',
                    lineHeight: 1.1,
                }}>{title}</h1>
                <p style={{
                    fontSize: '1rem',
                    color: 'var(--color-text-muted)',
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    marginBottom: '2rem',
                }}>{subtitle}</p>
                <Link href={link} style={{
                    padding: '0.9rem 2.8rem',
                    background: 'var(--color-gold)',
                    color: 'var(--color-text-main)',
                    textDecoration: 'none',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    display: 'inline-block',
                    transition: 'all 0.3s ease',
                    border: '1px solid #d4af37',
                }}
                    onMouseOver={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#000'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'var(--color-gold)'; e.currentTarget.style.color = '#000'; }}
                >
                    Explore Collection
                </Link>
            </div>

            {/* Scroll hint */}
            <div style={{
                position: 'absolute',
                bottom: '28px',
                right: '32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                zIndex: 2,
                animation: 'wglFadeUp 1.5s ease 1.4s backwards',
            }}>
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.6rem', letterSpacing: '3px', textTransform: 'uppercase', writingMode: 'vertical-rl' }}>Scroll</span>
                <div style={{
                    width: '1px',
                    height: '42px',
                    background: 'linear-gradient(to bottom, #d4af37, transparent)',
                    animation: 'wglScrollPulse 2s ease-in-out infinite',
                }} />
            </div>

            <style>{`
                @keyframes wglFadeUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes wglScrollPulse {
                    0%   { transform: scaleY(0); transform-origin: top; opacity: 1; }
                    60%  { transform: scaleY(1); transform-origin: top; }
                    100% { transform: scaleY(1); transform-origin: bottom; opacity: 0; }
                }
            `}</style>
        </div>
    );
}
