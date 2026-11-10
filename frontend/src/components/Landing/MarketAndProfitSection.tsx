import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Info, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { availableCrops } from '../../types';
import { fadeUp, viewportOnce } from './motionVariants';

interface YearlyAverages {
    [year: string]: number;
}

interface MarketHistoryResponse {
    crop: string;
    unit: string;
    history: { taluk: string; year: number; month: string; price: number; unit: string }[];
    yearly_averages: YearlyAverages;
}

interface LiveMarketRecord {
    market: string;
    commodity: string;
    modal_price: number;
    min_price: number;
    max_price: number;
    arrival_date: string;
}

interface LiveMarketResponse {
    source: string;
    records: LiveMarketRecord[];
}

export const MarketIntelligenceSection: React.FC = () => {
    const [crop, setCrop] = useState('Rice');
    const [history, setHistory] = useState<MarketHistoryResponse | null>(null);
    const [liveRecord, setLiveRecord] = useState<LiveMarketRecord | null>(null);
    const [source, setSource] = useState('');
    const [loading, setLoading] = useState(false);

    const load = async (selectedCrop: string) => {
        setLoading(true);
        try {
            const [histRes, liveRes] = await Promise.all([
                fetch(`${API_BASE_URL}/market-history/${encodeURIComponent(selectedCrop)}`),
                fetch(`${API_BASE_URL}/market-prices-live`),
            ]);
            if (histRes.ok) setHistory(await histRes.json());
            if (liveRes.ok) {
                const liveData: LiveMarketResponse = await liveRes.json();
                setSource(liveData.source);
                const match = liveData.records.find(r => r.commodity.toLowerCase().includes(selectedCrop.toLowerCase()));
                setLiveRecord(match || liveData.records[0] || null);
            }
        } catch {
            // leave state as-is; empty-state UI below handles it
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load(crop);
    }, [crop]);

    const years = history ? Object.keys(history.yearly_averages).sort() : [];
    const maxPrice = years.length ? Math.max(...years.map(y => history!.yearly_averages[y])) : 0;

    return (
        <section id="market-intelligence" style={{ background: 'var(--l-mint)' }}>
            <div className="l-container">
                <motion.div
                    className="l-section-head"
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOnce}
                    variants={fadeUp}
                >
                    <span className="l-eyebrow">Market Intelligence</span>
                    <h2>Understand the Market Before Planning Your Harvest.</h2>
                </motion.div>

                <motion.div
                    className="l-market-grid"
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOnce}
                    variants={fadeUp}
                >
                    <div className="l-market-summary">
                        <select className="l-market-crop-select" value={crop} onChange={(e) => setCrop(e.target.value)}>
                            {availableCrops.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>

                        {liveRecord ? (
                            <>
                                <div className="l-market-row"><span>Market</span><span>{liveRecord.market}</span></div>
                                <div className="l-market-row"><span>Commodity</span><span>{liveRecord.commodity}</span></div>
                                <div className="l-market-row"><span>Modal Price</span><span>₹{liveRecord.modal_price.toLocaleString('en-IN')}</span></div>
                                <div className="l-market-row"><span>Range</span><span>₹{liveRecord.min_price.toLocaleString('en-IN')} – ₹{liveRecord.max_price.toLocaleString('en-IN')}</span></div>
                                <div className="l-market-row"><span>Date</span><span>{liveRecord.arrival_date}</span></div>
                                <div className="l-market-row"><span>Source</span><span>{source}</span></div>
                            </>
                        ) : (
                            <div className="l-interactive-empty" style={{ padding: '1.5rem 0' }}>
                                <AlertCircle size={24} />
                                {loading ? 'Loading market data...' : 'No current market record found for this crop.'}
                            </div>
                        )}
                    </div>

                    <div className="l-chart-card">
                        <h4>5-Year Price History{history ? ` (${history.unit})` : ''}</h4>
                        <p className="l-chart-label">Yearly average price for {crop}</p>

                        {years.length > 0 ? (
                            <div className="l-bar-chart">
                                {years.map(y => {
                                    const val = history!.yearly_averages[y];
                                    const heightPct = maxPrice > 0 ? Math.max((val / maxPrice) * 100, 6) : 6;
                                    return (
                                        <div className="l-bar-col" key={y}>
                                            <span className="l-bar-val">₹{val.toLocaleString('en-IN')}</span>
                                            <div className="l-bar" style={{ height: `${heightPct}%` }}></div>
                                            <span className="l-bar-year">{y}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="l-interactive-empty" style={{ padding: '1.5rem 0' }}>
                                <Info size={24} />
                                No historical price records available for this crop yet.
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export const ProfitEstimationSection: React.FC = () => {
    const [crop, setCrop] = useState('Rice');
    const [acres, setAcres] = useState('2');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const calculate = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ crop, acres: acres || '1' });
            const res = await fetch(`${API_BASE_URL}/profit-estimate?${params.toString()}`);
            if (res.ok) setResult(await res.json());
        } catch {
            // ignore; keep previous result
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        calculate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <section id="profit-estimation" style={{ background: 'var(--l-white)' }}>
            <div className="l-container">
                <motion.div
                    className="l-section-head"
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOnce}
                    variants={fadeUp}
                >
                    <span className="l-eyebrow l-eyebrow-gold">Profit Estimation</span>
                    <h2>Look Beyond Yield. Understand Potential Returns.</h2>
                </motion.div>

                <motion.div
                    className="l-profit-panel"
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOnce}
                    variants={fadeUp}
                >
                    <div className="l-profit-inputs">
                        <h4>Your Inputs</h4>
                        <div className="l-profit-field l-full">
                            <label htmlFor="pe-crop">Crop</label>
                            <select id="pe-crop" value={crop} onChange={(e) => setCrop(e.target.value)}>
                                {availableCrops.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="l-profit-field l-full">
                            <label htmlFor="pe-acres">Land Area (acres)</label>
                            <input
                                id="pe-acres"
                                type="number"
                                min="0.5"
                                step="0.5"
                                value={acres}
                                onChange={(e) => setAcres(e.target.value)}
                            />
                        </div>
                        <button className="l-btn l-btn-primary" style={{ width: '100%' }} onClick={calculate} disabled={loading}>
                            {loading ? 'Calculating...' : 'Calculate Potential Returns'}
                        </button>
                    </div>

                    <div className="l-profit-outputs">
                        <h4>Estimated Outcome</h4>
                        {result ? (
                            <>
                                <div className="l-profit-row"><span>Estimated Yield</span><span>{result.estimated_total_yield} {result.yield_unit}</span></div>
                                <div className="l-profit-row"><span>Current Price / Unit</span><span>{result.price_display}</span></div>
                                <div className="l-profit-row"><span>Estimated Revenue</span><span>₹{Number(result.estimated_revenue).toLocaleString('en-IN')}</span></div>
                                <div className="l-profit-row"><span>Estimated Input Cost</span><span>₹{Number(result.estimated_input_cost).toLocaleString('en-IN')}</span></div>
                                <div className="l-profit-row"><span>Estimated Net Profit</span><span>₹{Number(result.estimated_profit).toLocaleString('en-IN')}</span></div>
                            </>
                        ) : (
                            <div className="l-interactive-empty" style={{ padding: '1.5rem 0' }}>
                                <Info size={24} /> Enter your farm details to see an estimate.
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
