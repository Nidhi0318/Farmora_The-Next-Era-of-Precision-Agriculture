import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    MapPin, Sprout, CloudSun, BarChart3, Banknote, LayoutDashboard,
    Target, Wallet, FileText, FileSearch, LineChart, UserCheck,
    AlertCircle
} from 'lucide-react';
import { getDistrictsForState } from '../../data/locations';
import { API_BASE_URL } from '../../config';
import { cropEmojis } from '../../types';
import { fadeUp, staggerChildren, viewportOnce } from './motionVariants';

interface DistributionEntry {
    crop: string;
    area_1000ha: number;
    share_of_covered_cropped_area_pct: number;
}

interface DistributionResponse {
    district: string;
    year: number;
    distribution: DistributionEntry[];
    scope_note: string;
    source: string;
    source_url: string;
    coverage_period: string;
}

export const RegionalInsightsSection: React.FC = () => {
    const districts = getDistrictsForState('Karnataka');
    const [district, setDistrict] = useState('Dakshina Kannada');
    const [data, setData] = useState<DistributionResponse | null>(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const load = async () => {
            setNotFound(false);
            try {
                const res = await fetch(`${API_BASE_URL}/regional-crop-distribution/${encodeURIComponent(district)}`);
                if (res.ok) {
                    setData(await res.json());
                } else {
                    setData(null);
                    setNotFound(true);
                }
            } catch {
                setData(null);
                setNotFound(true);
            }
        };
        load();
    }, [district]);

    return (
        <section id="regional-insights" className="l-regional">
            <div className="l-container">
                <motion.div
                    className="l-section-head"
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOnce}
                    variants={fadeUp}
                >
                    <span className="l-eyebrow">Regional Insights</span>
                    <h2>Explore Agricultural Patterns Across Your Region.</h2>
                    <p>Understand available regional crop distribution, historical patterns, and agricultural trends.</p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOnce}
                    variants={fadeUp}
                >
                    <select
                        className="l-market-crop-select"
                        style={{ maxWidth: 320, margin: '0 auto 1.5rem', display: 'block' }}
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                    >
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>

                    {data && (
                        <>
                            <div className="l-crop-dist-grid">
                                {data.distribution.slice(0, 8).map(d => (
                                    <div className="l-crop-dist-card" key={d.crop}>
                                        <span className="l-crop-dist-emoji">{cropEmojis[d.crop] || '🌿'}</span>
                                        <div className="l-crop-dist-name">{d.crop}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--l-text-muted)', marginTop: '0.2rem' }}>
                                            {d.share_of_covered_cropped_area_pct}% of covered area
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {notFound && (
                        <div className="l-interactive-empty">
                            <AlertCircle size={28} />
                            No crop-distribution data available for {district} yet.
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    );
};

export const DashboardPreviewSection: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
    return (
        <section className="l-dashboard-preview">
            <div className="l-container">
                <motion.div
                    className="l-section-head"
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOnce}
                    variants={fadeUp}
                >
                    <span className="l-eyebrow">See It In Action</span>
                    <h2>A Preview of Your Farmer Dashboard.</h2>
                    <p>Everything you need for your farm, in one dashboard.</p>
                </motion.div>

                <motion.div
                    className="l-mockup-frame"
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOnce}
                    variants={fadeUp}
                >
                    <div className="l-mockup-bar">
                        <span className="l-mockup-dot"></span>
                        <span className="l-mockup-dot"></span>
                        <span className="l-mockup-dot"></span>
                        <span className="l-mockup-label"><LayoutDashboard size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />Farmer Dashboard — Preview</span>
                    </div>
                    <div className="l-mockup-body">
                        <div className="l-mockup-card">
                            <h5><Sprout size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />Top Crop</h5>
                            <div className="l-mockup-big">Rice (Paddy)</div>
                        </div>
                        <div className="l-mockup-card">
                            <h5><CloudSun size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />Weather</h5>
                            <div className="l-mockup-big">27.3°C</div>
                        </div>
                        <div className="l-mockup-card">
                            <h5><BarChart3 size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />Market Rate</h5>
                            <div className="l-mockup-big">₹2,200/qtl</div>
                        </div>
                        <div className="l-mockup-card">
                            <h5><Banknote size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />Est. Profit</h5>
                            <div className="l-mockup-big">₹21,780/acre</div>
                        </div>
                        <div className="l-mockup-card">
                            <h5><MapPin size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />Land</h5>
                            <div className="l-mockup-big">2 Acres</div>
                        </div>
                        <div className="l-mockup-card">
                            <h5><Target size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />Suitability</h5>
                            <div className="l-mockup-big">92%</div>
                        </div>
                    </div>
                </motion.div>
                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <button className="l-btn l-btn-primary" onClick={onGetStarted}>Explore Your Farmer Dashboard</button>
                </div>
            </div>
        </section>
    );
};

export const WhyChooseSection: React.FC = () => {
    const items = [
        { icon: <Target size={20} />, title: 'More Informed Crop Selection', desc: 'Compare crops by real suitability scores, not guesswork.' },
        { icon: <Wallet size={20} />, title: 'Visibility Into Cultivation Costs', desc: 'See estimated revenue, cost and profit before you plant.' },
        { icon: <FileSearch size={20} />, title: 'Access to Relevant Agricultural Information', desc: 'Weather, soil, and market data pulled from real sources.' },
        { icon: <FileText size={20} />, title: 'Clear Explanations Behind Recommendations', desc: 'Every score is tied to pH, temperature, rainfall and soil type.' },
        { icon: <LineChart size={20} />, title: 'Market Information in Context', desc: 'Prices shown alongside historical trends, not in isolation.' },
        { icon: <UserCheck size={20} />, title: 'A Simple, Farmer-Focused Interface', desc: 'Built for quick decisions in the field, in English or Kannada.' },
    ];
    return (
        <section id="about" className="l-why">
            <div className="l-container">
                <motion.div
                    className="l-section-head"
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOnce}
                    variants={fadeUp}
                >
                    <span className="l-eyebrow l-eyebrow-gold">Why This Platform</span>
                    <h2>Practical Agricultural Intelligence, In One Place.</h2>
                </motion.div>
                <motion.div
                    className="l-why-grid"
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOnce}
                    variants={staggerChildren}
                >
                    {items.map((it, i) => (
                        <motion.div className={`l-why-item${i % 2 === 1 ? ' l-why-item-gold' : ''}`} key={it.title} variants={fadeUp}>
                            {it.icon}
                            <div>
                                <h4>{it.title}</h4>
                                <p>{it.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};
