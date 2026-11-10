import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring, AnimatePresence, type Variants } from 'framer-motion';
import { Sprout, CloudSun, Banknote, BarChart3, ChevronDown, ChevronRight } from 'lucide-react';
import heroVideoSrc from '../../assets/video/hero-background.mp4';

/*
  Multi-chapter version of Pariskq's scroll-triggered video hero: the video background stays
  pinned (position: sticky) for the whole hero, while three chapters of copy scroll through
  on top of it, each revealing via whileInView as its own 100vh slice comes into view —
  same mechanic as the reference, one shared farm video instead of a per-chapter video.
*/

interface Chapter {
    id: string;
    badge: string;
    heading: string;
    subhead: string;
    ctaLabel: string;
    onCta: () => void;
}

const textContainer: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
};

const textReveal: Variants = {
    hidden: { y: '100%', opacity: 0 },
    visible: { y: '0%', opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

const fadeIn: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.3, ease: 'easeOut' } },
};

function FilmGrain() {
    return (
        <div className="l-film-grain" aria-hidden="true">
            <div
                style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat',
                }}
            />
        </div>
    );
}

function VideoBackground() {
    const videoRef = useRef<HTMLVideoElement>(null);

    // Autoplay is blocked unless muted is set as a property (React doesn't reflect it as an
    // attribute reliably), and some browsers skip it while the page is still hydrating —
    // retry on canplay and on the first user gesture so the background never stays frozen.
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        video.muted = true;
        const tryPlay = () => {
            if (video.paused) video.play().catch(() => {});
        };
        const onFirstGesture = () => {
            tryPlay();
            window.removeEventListener('pointerdown', onFirstGesture);
            window.removeEventListener('scroll', onFirstGesture);
        };
        video.addEventListener('canplay', tryPlay);
        window.addEventListener('pointerdown', onFirstGesture);
        window.addEventListener('scroll', onFirstGesture, { passive: true });
        tryPlay();
        return () => {
            video.removeEventListener('canplay', tryPlay);
            window.removeEventListener('pointerdown', onFirstGesture);
            window.removeEventListener('scroll', onFirstGesture);
        };
    }, []);

    return (
        <div className="l-hero-video-wrap" aria-hidden="true">
            <video
                ref={videoRef}
                src={heroVideoSrc}
                className="l-hero-video"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
            />
            <div className="l-hero-scrim" />
            <FilmGrain />
        </div>
    );
}

function ChapterNav({
    activeIndex,
    chapters,
    progress,
}: {
    activeIndex: number;
    chapters: Chapter[];
    progress: ReturnType<typeof useScroll>['scrollYProgress'];
}) {
    const smoothProgress = useSpring(progress, { stiffness: 100, damping: 30 });

    return (
        <motion.div
            className="l-scroll-pill"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
        >
            <div className="l-chapter-nav-label">
                <span className="l-chapter-nav-index">Chapter {chapters[activeIndex].id}</span>
                <AnimatePresence mode="wait">
                    <motion.span
                        key={activeIndex}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                        className="l-chapter-nav-title"
                    >
                        {chapters[activeIndex].badge}
                    </motion.span>
                </AnimatePresence>
            </div>
            <div className="l-scroll-pill-ring">
                <svg width="40" height="40" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="16" className="l-scroll-ring-track" strokeWidth="2" fill="none" />
                    <motion.circle
                        cx="20" cy="20" r="16" className="l-scroll-ring-progress" strokeWidth="2" fill="none"
                        strokeDasharray="100"
                        style={{ pathLength: smoothProgress, rotate: -90, transformOrigin: '50% 50%' }}
                    />
                </svg>
                <ChevronDown size={14} className="l-scroll-ring-icon" />
            </div>
        </motion.div>
    );
}

interface HeroSectionProps {
    onPrimaryCta: () => void;
    onExplore: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onPrimaryCta, onExplore }) => {
    const sectionRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
    const [activeIndex, setActiveIndex] = useState(0);

    const chapters: Chapter[] = [
        {
            id: '01',
            badge: 'AI-Powered Precision Agriculture',
            heading: 'Grow Smarter, Harvest Better',
            subhead: 'Make more informed farming decisions with intelligent crop recommendations, weather insights, agricultural market information, and potential profit estimates — all in one place.',
            ctaLabel: 'Find the Right Crop',
            onCta: onPrimaryCta,
        },
        {
            id: '02',
            badge: 'Weather & Market Intelligence',
            heading: 'Know Your Conditions, Know Your Market',
            subhead: 'Live weather, soil and climate data paired with APMC market prices, so you can time your planting and your selling with real information, not guesswork.',
            ctaLabel: 'Explore Market Intelligence',
            onCta: onExplore,
        },
        {
            id: '03',
            badge: 'Profit Estimation',
            heading: 'See the Numbers Before You Plant',
            subhead: 'Estimated yield, revenue and net profit for every crop you consider — so the decision is about more than just what grows well.',
            ctaLabel: 'Estimate Your Profit',
            onCta: onExplore,
        },
    ];

    useEffect(() => {
        const unsubscribe = scrollYProgress.on('change', (latest) => {
            const newIndex = Math.min(Math.floor(latest * chapters.length), chapters.length - 1);
            setActiveIndex((prev) => (prev === newIndex ? prev : newIndex));
        });
        return () => unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scrollYProgress]);

    return (
        <section
            id="top"
            className="l-hero l-hero-video-hero"
            ref={sectionRef}
            style={{ height: `${chapters.length * 100}vh` }}
        >
            <div className="l-hero-sticky">
                <VideoBackground />
                <ChapterNav activeIndex={activeIndex} chapters={chapters} progress={scrollYProgress} />
            </div>

            <div className="l-hero-chapters-overlay">
                {chapters.map((chapter, i) => (
                    <div className="l-hero-chapter-slide" key={chapter.id}>
                        <motion.div
                            variants={textContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: false, margin: '-20%' }}
                            className="l-hero-video-copy l-hero-chapter-copy"
                        >
                            <motion.div variants={fadeIn} className="l-hero-eyebrow-row">
                                <span className="l-eyebrow-line" />
                                <span className="l-hero-chapter-badge">{chapter.badge}</span>
                            </motion.div>

                            <div className="l-hero-heading-mask">
                                <motion.h1 variants={textReveal}>{chapter.heading}</motion.h1>
                            </div>

                            <motion.div variants={fadeIn} className="l-hero-sub-card">
                                <p className="l-hero-sub">{chapter.subhead}</p>
                            </motion.div>

                            <motion.div variants={fadeIn} className="l-hero-video-cta-row">
                                <motion.a
                                    href={i === 0 ? '#crop-intelligence' : '#features'}
                                    onClick={(e) => { e.preventDefault(); chapter.onCta(); }}
                                    whileHover={{ scale: 1.05, x: 6 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="l-hero-video-cta"
                                >
                                    <span className="l-hero-video-cta-circle">
                                        <ChevronRight size={20} />
                                    </span>
                                    <span className="l-hero-chapter-badge">{chapter.ctaLabel}</span>
                                </motion.a>
                                {i === 0 && (
                                    <button className="l-hero-video-cta-secondary" onClick={onExplore}>
                                        Explore the Platform
                                    </button>
                                )}
                            </motion.div>

                            {i === 0 && (
                                <motion.div variants={fadeIn} className="l-hero-benefits l-hero-benefits-video">
                                    <div className="l-hero-benefit"><Sprout size={16} /> AI-Powered Crop Recommendations</div>
                                    <div className="l-hero-benefit"><CloudSun size={16} /> Weather and Market Intelligence</div>
                                    <div className="l-hero-benefit"><Banknote size={16} /> Farming Profit Estimation</div>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export const CapabilityStrip: React.FC = () => {
    const items = [
        { icon: <Sprout size={20} />, title: 'AI Crop Recommendation', desc: 'Matched to your soil, climate and season' },
        { icon: <CloudSun size={20} />, title: 'Weather Intelligence', desc: 'Live data from Open-Meteo & NASA POWER' },
        { icon: <BarChart3 size={20} />, title: 'Agricultural Market Insights', desc: 'APMC prices via Krishimaratavahini & data.gov.in' },
        { icon: <Banknote size={20} />, title: 'Profit Estimation', desc: 'Yield, revenue and cost assumptions, upfront' },
    ];
    return (
        <section className="l-capabilities">
            <div className="l-container l-capability-grid">
                {items.map((item, i) => (
                    <motion.div
                        className="l-capability-item"
                        key={item.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className={`l-capability-icon${i % 2 === 1 ? ' l-capability-icon-gold' : ''}`}>{item.icon}</div>
                        <div>
                            <h4>{item.title}</h4>
                            <p>{item.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};
