import React from 'react';
import { motion } from 'framer-motion';
import { BrandLockup } from '../Brand';
import { fadeUp, viewportOnce } from './motionVariants';

interface CTAProps {
    onGetStarted: () => void;
    onLogin: () => void;
}

export const FinalCTASection: React.FC<CTAProps> = ({ onGetStarted, onLogin }) => {
    return (
        <section className="l-final-cta">
            <motion.div
                className="l-container l-final-cta-inner"
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
                variants={fadeUp}
            >
                <h2>Make Your Next Farming Decision With More Confidence.</h2>
                <p>
                    Explore crop recommendations, agricultural market information, weather insights,
                    and potential returns through one connected farming experience.
                </p>
                <div className="l-final-cta-actions">
                    <motion.button
                        className="l-btn l-btn-primary"
                        onClick={onGetStarted}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        Create Your Free Account
                    </motion.button>
                    <button className="l-final-cta-login" onClick={onLogin}>Already Registered? Log In</button>
                </div>
            </motion.div>
        </section>
    );
};

export const LandingFooter: React.FC<CTAProps & { onNavigate: (id: string) => void }> = ({ onGetStarted, onLogin, onNavigate }) => {
    return (
        <footer className="l-footer">
            <div className="l-container">
                <div className="l-footer-grid">
                    <div>
                        <div className="l-footer-brand">
                            <BrandLockup size={44} light />
                        </div>
                        <p className="l-footer-desc">
                            AI-assisted precision agriculture for Karnataka farmers — crop recommendations,
                            weather, market intelligence and profit estimation in one place.
                        </p>
                    </div>

                    <div className="l-footer-col">
                        <h5>Platform</h5>
                        <button onClick={() => onNavigate('crop-intelligence')}>Crop Recommendations</button>
                        <button onClick={() => onNavigate('crop-intelligence')}>Weather Intelligence</button>
                        <button onClick={() => onNavigate('market-intelligence')}>Market Prices</button>
                        <button onClick={() => onNavigate('profit-estimation')}>Profit Estimation</button>
                        <button onClick={() => onNavigate('regional-insights')}>Regional Insights</button>
                    </div>

                    <div className="l-footer-col">
                        <h5>Account</h5>
                        <button onClick={() => onNavigate('about')}>About</button>
                        <button onClick={onLogin}>Login</button>
                        <button onClick={onGetStarted}>Register</button>
                    </div>
                </div>

                <div className="l-footer-bottom">
                    <span>© {new Date().getFullYear()} Farmora. Precision agriculture for farmers.</span>
                </div>
            </div>
        </footer>
    );
};
