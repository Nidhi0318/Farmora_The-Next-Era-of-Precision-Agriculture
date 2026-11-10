import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Cpu, Sprout, Scale } from 'lucide-react';
import { fadeUp, staggerChildren, viewportOnce } from './motionVariants';

export const HowItWorksSection: React.FC = () => {
    const steps = [
        {
            icon: <ClipboardList size={22} />,
            title: 'Tell Us About Your Farm',
            desc: 'Provide your location, land area, and relevant agricultural information.',
        },
        {
            icon: <Cpu size={22} />,
            title: 'Analyze Available Information',
            desc: 'The platform evaluates the agricultural and environmental data available for your farm.',
        },
        {
            icon: <Sprout size={22} />,
            title: 'Explore Suitable Crops',
            desc: 'Review crop recommendations and understand the factors contributing to their suitability.',
        },
        {
            icon: <Scale size={22} />,
            title: 'Compare Potential Outcomes',
            desc: 'Explore estimated expenses, potential returns, and market information.',
        },
    ];

    return (
        <section id="how-it-works" className="l-how">
            <div className="l-container">
                <motion.div
                    className="l-section-head"
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOnce}
                    variants={fadeUp}
                >
                    <span className="l-eyebrow">Process</span>
                    <h2>From Farm Details to Better-Informed Decisions.</h2>
                </motion.div>
                <motion.div
                    className="l-steps"
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOnce}
                    variants={staggerChildren}
                >
                    {steps.map((s, i) => (
                        <motion.div className="l-step" key={s.title} variants={fadeUp}>
                            <div className="l-step-number">{s.icon}</div>
                            <h3>{i + 1}. {s.title}</h3>
                            <p>{s.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};
