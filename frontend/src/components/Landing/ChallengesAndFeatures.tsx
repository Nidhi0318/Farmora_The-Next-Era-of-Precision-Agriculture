import React from 'react';
import { motion } from 'framer-motion';
import {
    Sprout, Wallet, CloudRain, TrendingDown, CloudSun, BarChart3, Banknote,
    Map, Lightbulb, Check, ArrowRight
} from 'lucide-react';
import { fadeUp, staggerChildren, viewportOnce } from './motionVariants';

export const ChallengesSection: React.FC = () => {
    const challenges = [
        {
            icon: <Sprout size={22} />,
            title: 'Crop Selection',
            desc: "Explore crops that may suit your farm's location, soil conditions, and growing season.",
        },
        {
            icon: <Wallet size={22} />,
            title: 'Profit Uncertainty',
            desc: 'Compare estimated cultivation expenses, potential revenue, and potential net profit.',
        },
        {
            icon: <CloudRain size={22} />,
            title: 'Weather Conditions',
            desc: 'Review available weather information and understand its possible implications for farming activities.',
        },
        {
            icon: <TrendingDown size={22} />,
            title: 'Market Uncertainty',
            desc: 'Explore available agricultural market prices and historical trends.',
        },
    ];

    return (
        <section className="l-challenges">
            <div className="l-container">
                <motion.div
                    className="l-section-head"
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOnce}
                    variants={fadeUp}
                >
                    <span className="l-eyebrow l-eyebrow-gold">Why It's Hard</span>
                    <h2>Better Decisions Begin With Better Information.</h2>
                    <p>
                        Choosing what to grow involves considering local conditions, seasonal
                        requirements, cultivation expenses, weather, and market information.
                    </p>
                </motion.div>
                <motion.div
                    className="l-challenge-grid"
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOnce}
                    variants={staggerChildren}
                >
                    {challenges.map((c, i) => (
                        <motion.div
                            className="l-challenge-card"
                            key={c.title}
                            variants={fadeUp}
                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        >
                            <div className={`l-challenge-icon${i % 2 === 1 ? ' l-challenge-icon-gold' : ''}`}>{c.icon}</div>
                            <h3>{c.title}</h3>
                            <p>{c.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

interface FeaturesGridProps {
    onNavigate: (section: string) => void;
}

export const FeaturesGrid: React.FC<FeaturesGridProps> = ({ onNavigate }) => {
    const features = [
        {
            icon: <Sprout size={22} />,
            title: 'Discover Crops That Fit Your Farm.',
            desc: 'Explore crop recommendations based on available soil, location, climate, and seasonal information.',
            points: ['Crop name & suitability score', 'Relevant environmental factors', 'Growing-season information', 'Explanation of the recommendation'],
            cta: 'Explore Crop Recommendations',
            target: 'crop-intelligence',
        },
        {
            icon: <CloudSun size={22} />,
            title: 'Understand Your Growing Conditions.',
            desc: 'Review available weather information and forecasts to help plan farming activities.',
            points: ['Temperature & humidity', 'Precipitation', 'Forecast information', 'Soil moisture & climate normals'],
            cta: 'Explore Weather Insights',
            target: 'crop-intelligence',
        },
        {
            icon: <BarChart3 size={22} />,
            title: 'Make More Informed Market Decisions.',
            desc: 'Review available agricultural prices, market information, and historical trends.',
            points: ['Crop, market & price', 'Unit & observation date', 'Historical trend chart'],
            cta: 'Explore Market Prices',
            target: 'market-intelligence',
        },
        {
            icon: <Banknote size={22} />,
            title: 'Understand the Economics Before You Grow.',
            desc: 'Estimate cultivation expenses, potential revenue, and potential net profit.',
            points: ['Estimated cultivation cost', 'Expected yield', 'Estimated revenue & net profit'],
            cta: 'Estimate Crop Profit',
            target: 'profit-estimation',
        },
        {
            icon: <Map size={22} />,
            title: 'Understand Agriculture in Your Region.',
            desc: 'Explore available regional crop patterns, geographic distribution, and agricultural trends.',
            points: ['Crop distribution', 'Historical crop trends', 'District-level filtering'],
            cta: 'Explore Regional Insights',
            target: 'regional-insights',
        },
        {
            icon: <Lightbulb size={22} />,
            title: 'Know Why a Recommendation Makes Sense.',
            desc: 'Understand the factors influencing crop suitability and compare alternatives using available agricultural information.',
            points: ['Soil pH & type', 'Temperature & rainfall', 'District-specific suitability'],
            cta: 'Discover How It Works',
            target: 'how-it-works',
        },
    ];

    return (
        <section id="features" className="l-how" style={{ background: 'var(--l-ivory)' }}>
            <div className="l-container">
                <motion.div
                    className="l-section-head"
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOnce}
                    variants={fadeUp}
                >
                    <span className="l-eyebrow">Platform Capabilities</span>
                    <h2>Six Ways We Help You Decide.</h2>
                    <p>Each feature below is backed by real data from this platform's own backend — not hardcoded samples.</p>
                </motion.div>
                <motion.div
                    className="l-feature-grid"
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOnce}
                    variants={staggerChildren}
                >
                    {features.map((f, i) => (
                        <motion.div
                            className="l-feature-card"
                            key={f.title}
                            variants={fadeUp}
                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        >
                            <div className={`l-feature-icon${i % 3 === 1 ? ' l-feature-icon-gold' : ''}`}>{f.icon}</div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                            <ul className="l-feature-list">
                                {f.points.map(p => (
                                    <li key={p}><Check size={14} /> {p}</li>
                                ))}
                            </ul>
                            <motion.button
                                className="l-btn-ghost"
                                onClick={() => onNavigate(f.target)}
                                whileHover={{ x: 4 }}
                            >
                                {f.cta} <ArrowRight size={15} />
                            </motion.button>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};
