import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Target } from 'lucide-react';
import { CodeAnalysisGraph } from '../components/CodeAnalysisGraph';
import { FutureScopeSection } from '../components/FutureScopeSection';
import './LandingPage.css';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [typedText, setTypedText] = useState('');
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    const cursorRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const scrollProgressRef = useRef<HTMLDivElement>(null);
    const navRef = useRef<HTMLElement>(null); // This was missing in your non-working version

    const handleLaunch = () => navigate('/login');
    const toggleFaq = (index: number) => setActiveFaq(activeFaq === index ? null : index);

    // --- NAVBAR SMOOTH SCROLL FIX ---
    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        const id = href.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
            const navHeight = navRef.current?.offsetHeight || 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - navHeight;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    // --- 1. MOUSE FOLLOWER (Custom Cursor) ---
    useEffect(() => {
        const cursor = cursorRef.current;

        const moveCursor = (e: MouseEvent) => {
            if (cursor) {
                cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
            }
        };

        const hoverStart = () => cursor?.classList.add('hovered');
        const hoverEnd = () => cursor?.classList.remove('hovered');

        window.addEventListener('mousemove', moveCursor);

        // Add listeners to all clickable elements
        const targets = document.querySelectorAll('a, button, .glass-card, .faq-item');
        targets.forEach(el => {
            el.addEventListener('mouseenter', hoverStart);
            el.addEventListener('mouseleave', hoverEnd);
        });

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            targets.forEach(el => {
                el.removeEventListener('mouseenter', hoverStart);
                el.removeEventListener('mouseleave', hoverEnd);
            });
        };
    }, []);

    // --- 2. NEURAL BACKGROUND (Crash-Proof) ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const particles: { x: number, y: number, vx: number, vy: number }[] = [];
        const particleCount = Math.min(Math.floor(window.innerWidth / 20), 80);

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3
            });
        }

        let animationFrameId: number;

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                ctx.fillStyle = '#3B82F6';
                ctx.globalAlpha = 0.4;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
                ctx.fill();

                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dist = Math.sqrt(Math.pow(p.x - p2.x, 2) + Math.pow(p.y - p2.y, 2));

                    if (dist < 150) {
                        ctx.globalAlpha = 0.1 * (1 - dist / 150);
                        ctx.strokeStyle = '#3B82F6';
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // --- 3. SCROLL PHYSICS ---
    useEffect(() => {
        let lastScrollY = window.scrollY;
        let ticking = false;

        const updatePhysics = () => {
            const currentScrollY = window.scrollY;
            const velocity = currentScrollY - lastScrollY;
            lastScrollY = currentScrollY;

            // Subtle Skew Effect
            const skew = Math.min(Math.max(velocity * 0.05, -2), 2);
            document.querySelectorAll('.velocity-skew').forEach((el) => {
                (el as HTMLElement).style.transform = `skewY(${skew}deg)`;
            });

            // Update Progress Bar
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (currentScrollY / totalHeight) * 100;
            if (scrollProgressRef.current) {
                scrollProgressRef.current.style.width = `${progress}%`;
            }

            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(updatePhysics);
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // --- 4. TERMINAL TEXT ---
    useEffect(() => {
        const text = `> INITIATING_ThreatLens_CORE...\n> SCANNING_DEPENDENCY_TREE...\n> [!] CRITICAL_VULN_FOUND: CVE-2024-3801\n> APPLYING_HOTFIX_PATCH...\n> SYSTEM_SECURE.`;
        let i = 0;
        let timeout: NodeJS.Timeout;
        const type = () => {
            if (i < text.length) {
                setTypedText(prev => prev + text.charAt(i));
                i++;
                timeout = setTimeout(type, Math.random() * 30 + 30);
            }
        };
        type();
        return () => clearTimeout(timeout);
    }, []);

    // --- 5. REVEAL OBSERVER ---
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('active');
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.reveal-mask').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return (
        <div className="min-h-screen relative font-sans selection:bg-blue-500 selection:text-white" style={{ backgroundColor: '#0B0F19' }}>

            {/* --- GLOBAL OVERLAYS --- */}
            <div ref={cursorRef} className="custom-cursor hidden md:block" />
            <div ref={scrollProgressRef} className="scroll-progress-bar" />
            <div className="noise-overlay" />
            <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-0" />

            {/* --- NAVBAR --- */}
            <nav ref={navRef} className="fixed top-0 w-full border-b border-white/10 bg-[#0B0F19]/90 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-3 h-8 bg-blue-500 rounded-sm animate-pulse shadow-[0_0_15px_#3B82F6]" />
                        <span className="text-xl font-bold tracking-widest font-mono text-white group-hover:text-blue-400 transition-colors">ThreatLens</span>
                    </div>
                    <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
                        {[
                            { name: 'Methodology', id: 'methodology' },
                            { name: 'Features', id: 'features' },
                            { name: 'Architecture', id: 'architecture' },
                            { name: 'Future Scopes', id: 'roadmap' },
                            { name: 'FAQ', id: 'faq' }
                        ].map((item) => (
                            <a
                                key={item.name}
                                href={`#${item.id}`}
                                onClick={(e) => scrollToSection(e, `#${item.id}`)}
                                className="hover:text-white transition-colors cursor-pointer"
                            >
                                {item.name}
                            </a>
                        ))}
                    </div>
                    <button onClick={handleLaunch} className="px-5 py-2 bg-blue-500/10 border border-blue-500/50 text-blue-400 rounded hover:bg-blue-500 hover:text-white transition-all duration-300 font-mono text-xs tracking-wider cursor-pointer">
                        LAUNCH CONSOLE
                    </button>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <header className="relative pt-32 pb-20 px-6 min-h-screen flex flex-col justify-center items-center text-center overflow-hidden">
                <div className="aurora-blob w-[500px] h-[500px] bg-blue-600/20 top-[-100px] left-[20%]" />
                <div className="aurora-blob w-[400px] h-[400px] bg-purple-600/10 bottom-[-50px] right-[20%] animation-delay-2000" />

                <div className="relative z-10 max-w-5xl velocity-skew">
                    <div className="reveal-mask inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-mono mb-8">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                        SYSTEMS ONLINE // V4.2.0
                    </div>

                    <h1 className="reveal-mask text-5xl md:text-8xl font-black text-white leading-[1.1] mb-8 tracking-tight">
                        INTELLIGENCE FOR <br />
                        <span className="glitch-wrapper">
                            <span className="glitch-text text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-500" data-text="SECURE ENGINEERING">
                                SECURE ENGINEERING
                            </span>
                        </span>
                    </h1>

                    <p className="reveal-mask text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                        Bridge the gap between developer intent and adversarial logic using
                        <span className="text-white font-medium"> ethical simulation</span> and
                        <span className="text-white font-medium"> autonomous reasoning</span>.
                    </p>

                    <div className="reveal-mask flex flex-col sm:flex-row gap-6 justify-center">
                        <button 
                            onClick={() => navigate('/blue-team')} 
                            className="group relative px-10 py-5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 hover:scale-105 transition-all overflow-hidden cursor-pointer shadow-[0_0_30px_rgba(37,99,235,0.5)]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 opacity-0 group-hover:opacity-30 transition-opacity" />
                            <div className="relative z-10 flex items-center space-x-2">
                                <Shield className="w-5 h-5" />
                                <span>BLUE TEAM</span>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-400/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                        </button>
                        <button 
                            onClick={() => navigate('/red-team')}
                            className="group relative px-10 py-5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 hover:scale-105 transition-all overflow-hidden cursor-pointer shadow-[0_0_30px_rgba(239,68,68,0.5)]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-500 opacity-0 group-hover:opacity-30 transition-opacity" />
                            <div className="relative z-10 flex items-center space-x-2">
                                <Target className="w-5 h-5" />
                                <span>RED TEAM</span>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-400/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                        </button>
                    </div>
                </div>
            </header>

            {/* --- MARQUEE --- */}
            <div className="marquee-container">
                <div className="marquee-content font-mono text-gray-500 text-xs tracking-[0.2em]">
                    {Array(8).fill("TRUSTED_BY_SEC_OPS //").map((t, i) => (
                        <span key={i} className="flex items-center gap-8 whitespace-nowrap">
                            {t} <span className="text-white">MICROSOFT</span> <span className="text-blue-500">◆</span> <span className="text-white">GOOGLE</span> <span className="text-blue-500">◆</span> <span className="text-white">AWS</span>
                        </span>
                    ))}
                </div>
            </div>

            {/* --- METHODOLOGY --- */}
            <section id="methodology" className="py-32 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="reveal-mask relative rounded-xl border border-gray-800 bg-[#0B0F19] shadow-2xl overflow-hidden group">
                        <div className="h-10 border-b border-gray-800 bg-[#111827] flex items-center px-4 gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                            </div>
                            <div className="ml-4 px-3 py-0.5 bg-black/50 rounded text-[10px] text-gray-500 font-mono flex-1 text-center border border-white/5">
                                https://app.ThreatLens.io/mission-control
                            </div>
                        </div>

                        <div className="p-6 md:p-10 grid grid-cols-12 gap-6 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                            <div className="col-span-2 hidden md:block space-y-2">
                                {['Overview', 'Threats', 'Graph', 'Settings'].map((item, i) => (
                                    <div key={item} className={`h-8 rounded px-3 flex items-center text-xs font-mono ${i === 0 ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-gray-500 hover:text-white cursor-pointer'}`}>
                                        {item}
                                    </div>
                                ))}
                            </div>
                            <div className="col-span-12 md:col-span-10 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        { l: 'THREAT_LEVEL', v: 'ELEVATED', c: 'text-yellow-400' },
                                        { l: 'SYSTEM_STATUS', v: 'OPERATIONAL', c: 'text-green-400' },
                                        { l: 'ACTIVE_NODES', v: '842', c: 'text-blue-400' }
                                    ].map((stat) => (
                                        <div key={stat.l} className="glass-card p-6 rounded-lg">
                                            <div className="text-[10px] text-gray-500 font-mono mb-2 tracking-wider">{stat.l}</div>
                                            <div className={`text-2xl font-bold ${stat.c}`}>{stat.v}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-80">
                                    <div className="glass-card p-0 flex flex-col">
                                        <div className="px-4 py-2 border-b border-white/5 bg-black/40 text-[10px] font-mono text-gray-400">live_analysis.log</div>
                                        <div className="p-4 font-mono text-xs text-green-400 overflow-hidden relative flex-1 bg-black/80">
                                            <div className="whitespace-pre-wrap opacity-80 leading-relaxed">{typedText}</div>
                                            <div className="w-2 h-4 bg-green-500 animate-pulse inline-block align-middle ml-1" />
                                        </div>
                                    </div>
                                    <div className="glass-card p-6 flex items-center justify-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
                                        <div className="w-full h-full z-10">
                                            <div className="text-[10px] font-mono text-blue-300 mb-2 text-center">
                                                CODE_ANALYSIS_GRAPH
                                            </div>
                                            <CodeAnalysisGraph 
                                                width={400} 
                                                height={280}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FEATURES GRID --- */}
            <section id="features" className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-20 text-center velocity-skew">
                        <h2 className="text-4xl font-bold text-white mb-4">Core Capabilities</h2>
                        <p className="text-gray-400">Engineered for the modern threat landscape.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { title: 'Graph Analysis', desc: 'Visualizes attack paths through your dependency tree.', icon: '⚡' },
                            { title: 'Auto-Remediation', desc: 'Generates and applies patches automatically via PRs.', icon: '🛡️' },
                            { title: 'Zero-Day Sim', desc: 'Tests against theoretical exploit vectors.', icon: '🧪' },
                            { title: 'Compliance Map', desc: 'Real-time ISO27001 and SOC2 tracking.', icon: '📋' },
                            { title: 'Secret Detection', desc: 'Scans commit history for leaked entropy.', icon: '🔑' },
                            { title: 'CI/CD Guard', desc: 'Blocks builds if critical CVEs are introduced.', icon: '🏗️' },
                        ].map((card, i) => (
                            <div key={i} className="glass-card p-8 rounded-2xl group cursor-pointer reveal-mask" style={{ transitionDelay: `${i * 50}ms` }}>
                                <div className="text-3xl mb-6 group-hover:scale-110 transition-transform duration-300 bg-white/5 w-12 h-12 flex items-center justify-center rounded-lg">{card.icon}</div>
                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">{card.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- ARCHITECTURE --- */}
            <section id="architecture" className="py-32 px-6 border-t border-white/5 bg-black/20">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-white mb-16">System Architecture</h2>
                    <div className="relative">
                        {/* Desktop: Horizontal flow with arrows */}
                        <div className="hidden md:flex items-center justify-center gap-4">
                            {['INGESTION', 'ANALYSIS', 'SIMULATION', 'REMEDIATION'].map((step, i) => (
                                <React.Fragment key={i}>
                                    <div className="reveal-mask glass-card p-6 rounded-lg relative hover:-translate-y-2 transition-transform min-w-[180px]">
                                        <div className="text-xs font-mono text-blue-400 mb-2">0{i + 1}. PHASE</div>
                                        <h4 className="font-bold text-white">{step}</h4>
                                        {/* Status indicator */}
                                        <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                                    </div>
                                    {/* Arrow between steps - only show if not last */}
                                    {i < 3 && (
                                        <div className="flex items-center justify-center architecture-arrow">
                                            <svg 
                                                className="w-12 h-12 text-blue-500" 
                                                fill="none" 
                                                stroke="currentColor" 
                                                viewBox="0 0 24 24"
                                            >
                                                <path 
                                                    strokeLinecap="round" 
                                                    strokeLinejoin="round" 
                                                    strokeWidth={2.5} 
                                                    d="M13 7l5 5m0 0l-5 5m5-5H6" 
                                                />
                                            </svg>
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                        {/* Mobile: Vertical flow with arrows */}
                        <div className="md:hidden space-y-6">
                            {['INGESTION', 'ANALYSIS', 'SIMULATION', 'REMEDIATION'].map((step, i) => (
                                <React.Fragment key={i}>
                                    <div className="reveal-mask glass-card p-6 rounded-lg relative hover:-translate-y-2 transition-transform">
                                        <div className="text-xs font-mono text-blue-400 mb-2">0{i + 1}. PHASE</div>
                                        <h4 className="font-bold text-white">{step}</h4>
                                        <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                                    </div>
                                    {/* Vertical arrow between steps - only show if not last */}
                                    {i < 3 && (
                                        <div className="flex items-center justify-center py-2 architecture-arrow-vertical">
                                            <svg 
                                                className="w-8 h-8 text-blue-500" 
                                                fill="none" 
                                                stroke="currentColor" 
                                                viewBox="0 0 24 24"
                                            >
                                                <path 
                                                    strokeLinecap="round" 
                                                    strokeLinejoin="round" 
                                                    strokeWidth={2.5} 
                                                    d="M19 14l-5 5m0 0l-5-5m5 5V6" 
                                                />
                                            </svg>
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FUTURE SCOPE SECTION --- */}
            <FutureScopeSection />

            {/* --- FAQ SECTION --- */}
            <section id="faq" className="py-32 px-6 border-t border-white/5">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-white mb-12 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-2">
                        {[
                            { q: "How is this different from SonarQube?", a: "ThreatLens doesn't just find bugs; it simulates active attacks to prove exploitability, reducing false positives by 95%." },
                            { q: "Is my source code stored?", a: "No. Our analysis runs in ephemeral, air-gapped containers that are destroyed immediately after the session." },
                            { q: "Can I deploy on-premise?", a: "Yes. Enterprise plans include Docker containers and Helm charts for full on-premise air-gapped deployment." },
                            { q: "What languages are supported?", a: "Currently supports Python, Node.js, Go, Rust, Java, and C++. More coming soon." }
                        ].map((item, i) => (
                            <div key={i} className={`faq-item overflow-hidden rounded-lg border border-white/5 bg-white/5 reveal-mask`} onClick={() => toggleFaq(i)}>
                                <div className="flex justify-between items-center p-6 cursor-pointer hover:bg-white/5 transition-colors">
                                    <h3 className="text-sm font-medium text-white">{item.q}</h3>
                                    <span className={`text-blue-400 transition-transform duration-300 ${activeFaq === i ? 'rotate-180' : ''}`}>▼</span>
                                </div>
                                <div className={`px-6 text-gray-400 text-sm leading-relaxed transition-all duration-300 ease-in-out ${activeFaq === i ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    {item.a}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- CTA SECTION --- */}
            <section className="py-40 px-6 border-t border-white/5 relative overflow-hidden text-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="relative z-10 max-w-2xl mx-auto reveal-mask">
                    <h2 className="text-5xl font-bold text-white mb-8">Secure your infrastructure.</h2>
                    <p className="text-gray-400 mb-10">Join 10,000+ engineers shipping secure code faster.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button onClick={handleLaunch} className="px-10 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] cursor-pointer">
                            Start Free Trial
                        </button>
                        <button className="px-10 py-4 border border-gray-700 text-gray-300 rounded-lg hover:border-white hover:text-white transition-all cursor-pointer">
                            Talk to Sales
                        </button>
                    </div>
                </div>
            </section>

            {/* --- FINAL THOUGHT --- */}
            <div className="py-24 text-center border-t border-white/5 bg-[#0B0F19]">
                <div className="max-w-4xl mx-auto px-6">
                    <p className="font-mono text-sm md:text-base text-transparent bg-clip-text bg-gradient-to-r from-gray-500 via-gray-300 to-gray-500 tracking-[0.2em] uppercase opacity-80 hover:opacity-100 transition-opacity duration-700 cursor-default select-none">
                        "The only truly secure system is one that is powered off, cast in a block of concrete and sealed in a lead-lined room with armed guards - and even then I have my doubts."
                    </p>
                    <p className="mt-4 text-xs font-mono text-blue-500/60 tracking-widest">— GENE SPAFFORD</p>
                </div>
            </div>

            <footer className="py-12 border-t border-white/5 text-center text-gray-600 font-mono text-xs">
                <div className="mb-4 flex justify-center gap-6">
                    <a href="#" className="hover:text-blue-400 transition-colors cursor-pointer">TWITTER</a>
                    <a href="#" className="hover:text-blue-400 transition-colors cursor-pointer">GITHUB</a>
                    <a href="#" className="hover:text-blue-400 transition-colors cursor-pointer">LINKEDIN</a>
                </div>
                <p>ThreatLens // SECURITY_INTELLIGENCE_PLATFORM</p>
                <p className="mt-2">© 2026 ALL RIGHTS RESERVED</p>
            </footer>

        </div>
    );
};

export default LandingPage;
