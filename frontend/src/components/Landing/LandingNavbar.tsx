import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { BrandLockup } from '../Brand';

interface LandingNavbarProps {
    onLogin: () => void;
    onGetStarted: () => void;
}

const NAV_LINKS: { label: string; href: string }[] = [
    { label: 'Home', href: '#top' },
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Crop Intelligence', href: '#crop-intelligence' },
    { label: 'About', href: '#about' },
];

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ onLogin, onGetStarted }) => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeHref, setActiveHref] = useState('#top');

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Glass "liquid" pill glides to whichever section is centered in the viewport, not
    // just on click — a narrow detection band near mid-screen decides which section counts
    // as active as you scroll past it.
    useEffect(() => {
        const ids = NAV_LINKS.map((l) => l.href.slice(1));
        const sections = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
        if (!sections.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveHref(`#${entry.target.id}`);
                    }
                });
            },
            { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
        );
        sections.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const handleNavClick = (href: string) => {
        setMobileOpen(false);
        setActiveHref(href);
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <nav className={`l-navbar${scrolled ? ' l-scrolled' : ''}`}>
            <div className="l-container l-navbar-inner">
                <a href="#top" className="l-brand" aria-label="Farmora home" onClick={(e) => { e.preventDefault(); handleNavClick('#top'); }}>
                    <BrandLockup size={40} />
                </a>

                <div className="l-nav-links">
                    {NAV_LINKS.map(link => (
                        <a
                            key={link.href}
                            href={link.href}
                            className={activeHref === link.href ? 'l-nav-link-active' : ''}
                            onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                        >
                            {activeHref === link.href && (
                                <motion.span
                                    className="l-nav-pill"
                                    layoutId="l-nav-pill"
                                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                                />
                            )}
                            <span className="l-nav-link-label">{link.label}</span>
                        </a>
                    ))}
                </div>

                <div className="l-nav-actions">
                    <button className="l-nav-login" onClick={onLogin}>Login</button>
                    <motion.button
                        className="l-btn l-btn-primary"
                        onClick={onGetStarted}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                    >
                        Get Started
                    </motion.button>
                    <button
                        className="l-mobile-toggle"
                        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={mobileOpen}
                        onClick={() => setMobileOpen(v => !v)}
                    >
                        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            <div className={`l-mobile-menu${mobileOpen ? ' l-open' : ''}`}>
                {NAV_LINKS.map(link => (
                    <a
                        key={link.href}
                        href={link.href}
                        onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                    >
                        {link.label}
                    </a>
                ))}
                <button onClick={() => { setMobileOpen(false); onLogin(); }}>Login</button>
                <button onClick={() => { setMobileOpen(false); onGetStarted(); }}>Get Started</button>
            </div>
        </nav>
    );
};
