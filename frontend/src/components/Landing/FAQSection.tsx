import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { fadeUp, staggerChildren, viewportOnce } from './motionVariants';

const FAQS: { q: string; a: string }[] = [
    {
        q: 'What is this agricultural platform?',
        a: 'An AI-assisted precision agriculture tool for Karnataka farmers that combines weather, soil, market and crop-suitability data into one place, to help you compare crop choices and estimate potential returns before you plant.',
    },
    {
        q: 'How does AI-based crop recommendation work?',
        a: 'The platform scores each candidate crop against your district\'s soil pH, temperature, rainfall and humidity baselines (or your own entered values), filtered to crops already known to grow well in your district, then ranks them by a suitability score and predicted yield.',
    },
    {
        q: 'What information do I need to provide about my farm?',
        a: 'At minimum your state, district, taluk and land area. Optional details like exact soil pH, survey number and primary crop let the platform tailor results more precisely to your land.',
    },
    {
        q: 'Can I use the platform without registering?',
        a: 'Yes — this landing page\'s crop recommendation, market price, and profit estimation previews call the same live backend as the registered dashboard. Registering saves your farm details and unlocks your personal farm-history view and neighbour comparisons.',
    },
    {
        q: 'How are crop suitability scores calculated?',
        a: 'From the distance between your farm\'s soil pH, temperature, rainfall and humidity and each crop\'s known growing profile, combined with a district-specific predicted-yield model. A closer match produces a higher suitability score.',
    },
    {
        q: 'How is potential crop profit estimated?',
        a: 'The expected yield for your land is multiplied by the current market price, and typical input costs are subtracted to give an estimated net profit.',
    },
    {
        q: 'Are market prices updated in real time?',
        a: 'Prices are pulled from APMC market feeds such as Krishimaratavahini and data.gov.in whenever they are available.',
    },
    {
        q: 'Which geographic regions are supported?',
        a: 'All 31 Karnataka districts have real soil/climate baselines and crop-suitability data. The deepest historical yield and market-history records are specific to Dakshina Kannada. Other Indian states are not currently supported.',
    },
    {
        q: 'Can I compare multiple crops?',
        a: 'Yes — the crop recommendation results list multiple ranked crops side by side with their suitability score, yield and price, and the market and profit tools let you switch between crops to compare.',
    },
];

export const FAQSection: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="faq" className="l-faq">
            <div className="l-container">
                <motion.div
                    className="l-section-head"
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOnce}
                    variants={fadeUp}
                >
                    <span className="l-eyebrow">FAQ</span>
                    <h2>Frequently Asked Questions.</h2>
                </motion.div>
                <motion.div
                    className="l-faq-list"
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOnce}
                    variants={staggerChildren}
                >
                    {FAQS.map((item, i) => {
                        const isOpen = openIndex === i;
                        return (
                            <motion.div className="l-faq-item" data-open={isOpen} key={item.q} variants={fadeUp}>
                                <button
                                    className="l-faq-question"
                                    aria-expanded={isOpen}
                                    aria-controls={`faq-panel-${i}`}
                                    id={`faq-trigger-${i}`}
                                    onClick={() => setOpenIndex(isOpen ? null : i)}
                                >
                                    <span>{item.q}</span>
                                    <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                        <ChevronDown size={18} />
                                    </motion.span>
                                </button>
                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            id={`faq-panel-${i}`}
                                            role="region"
                                            aria-labelledby={`faq-trigger-${i}`}
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                                            style={{ overflow: 'hidden' }}
                                        >
                                            <div className="l-faq-answer">{item.a}</div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
};
