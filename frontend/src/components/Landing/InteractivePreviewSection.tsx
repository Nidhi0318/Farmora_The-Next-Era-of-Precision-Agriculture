import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Info, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { getDistrictsForState, getTaluksForDistrict } from '../../data/locations';
import { cropEmojis } from '../../types';
import { fadeUp, viewportOnce } from './motionVariants';

interface RecommendedCrop {
    crop: string;
    price: string;
    trend: string;
    predicted_yield_per_acre: number;
    suitability: string;
    suitability_factor: number;
}

interface RecommendationResponse {
    soil_data: { ph: number; temp: number; rainfall: number; soil_type: string };
    district: string;
    recommended_crops: RecommendedCrop[];
    methodology: string;
}

export const InteractivePreviewSection: React.FC = () => {
    const districts = getDistrictsForState('Karnataka');
    const [district, setDistrict] = useState('Dakshina Kannada');
    const [taluks, setTaluks] = useState<string[]>(getTaluksForDistrict('Dakshina Kannada'));
    const [taluk, setTaluk] = useState(taluks[0] || '');
    const [landAcres, setLandAcres] = useState('2');
    const [result, setResult] = useState<RecommendationResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        const list = getTaluksForDistrict(district);
        setTaluks(list);
        setTaluk(list[0] || '');
    }, [district]);

    const runPreview = async () => {
        if (!taluk) return;
        setLoading(true);
        setError(false);
        try {
            const res = await fetch(`${API_BASE_URL}/recommendations/${encodeURIComponent(taluk)}`);
            if (!res.ok) throw new Error('bad response');
            setResult(await res.json());
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        runPreview();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <section id="crop-intelligence" className="l-interactive">
            <div className="l-container">
                <motion.div
                    className="l-section-head"
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOnce}
                    variants={fadeUp}
                >
                    <span className="l-eyebrow">Try It Live</span>
                    <h2>Your Farm. Your Conditions. Smarter Crop Choices.</h2>
                    <p>
                        This runs against the platform's real crop-recommendation API in real time —
                        pick a district and taluk to see it respond.
                    </p>
                </motion.div>

                <motion.div
                    className="l-interactive-panel"
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOnce}
                    variants={fadeUp}
                >
                    <div className="l-interactive-inputs">
                        <h4>Farm Conditions</h4>
                        <div className="l-interactive-field">
                            <label htmlFor="landing-district">District</label>
                            <select id="landing-district" value={district} onChange={(e) => setDistrict(e.target.value)}>
                                {districts.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="l-interactive-field">
                            <label htmlFor="landing-taluk">Taluk</label>
                            <select id="landing-taluk" value={taluk} onChange={(e) => setTaluk(e.target.value)}>
                                {taluks.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="l-interactive-field">
                            <label htmlFor="landing-acres">Land Area (acres)</label>
                            <input
                                id="landing-acres"
                                type="number"
                                min="0.5"
                                step="0.5"
                                value={landAcres}
                                onChange={(e) => setLandAcres(e.target.value)}
                            />
                        </div>
                        <button className="l-btn l-interactive-btn" onClick={runPreview} disabled={loading}>
                            {loading ? <Loader2 size={16} className="l-spin" /> : <Search size={16} />}
                            {loading ? 'Analyzing...' : 'Get Crop Recommendations'}
                        </button>
                    </div>

                    <div className="l-interactive-results">
                        <h4>Recommended Crops{result ? ` for ${result.district}` : ''}</h4>

                        {loading && (
                            <div className="l-interactive-loading">
                                <Loader2 size={28} className="l-spin" />
                                Fetching live recommendations from the platform's API...
                            </div>
                        )}

                        {!loading && error && (
                            <div className="l-interactive-empty">
                                <Info size={28} />
                                Could not reach the recommendation service right now. Please try again in a moment.
                            </div>
                        )}

                        {!loading && !error && result && (
                            <>
                                {result.recommended_crops.slice(0, 5).map(c => {
                                    const acres = parseFloat(landAcres) || 0;
                                    const estYield = (c.predicted_yield_per_acre * acres).toFixed(1);
                                    return (
                                        <div className="l-result-card" key={c.crop}>
                                            <div className="l-result-left">
                                                <span className="l-result-emoji">{cropEmojis[c.crop] || '🌿'}</span>
                                                <div>
                                                    <div className="l-result-name">{c.crop}</div>
                                                    <div className="l-result-meta">
                                                        <span>{c.predicted_yield_per_acre}/acre yield</span>
                                                        <span>·</span>
                                                        <span>{estYield} total for {acres || 0} acres</span>
                                                        <span>·</span>
                                                        <span>{c.price}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="l-result-score">
                                                <div className="l-result-score-val">{Math.min(100, Math.round(c.suitability_factor * 100))}%</div>
                                                <div className="l-result-score-label">{c.suitability}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div className="l-interactive-note">
                                    Soil basis: pH {result.soil_data.ph}, {result.soil_data.soil_type}, ~{result.soil_data.temp}°C,
                                    {' '}{result.soil_data.rainfall}mm rainfall (district baseline — register and add your exact land
                                    details for a result tailored to your own farm). {result.methodology}.
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
