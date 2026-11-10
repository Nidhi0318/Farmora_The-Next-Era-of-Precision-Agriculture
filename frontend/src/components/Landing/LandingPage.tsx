import React from 'react';
import './landing.css';
import { LandingNavbar } from './LandingNavbar';
import { HeroSection, CapabilityStrip } from './HeroSection';
import { ChallengesSection, FeaturesGrid } from './ChallengesAndFeatures';
import { HowItWorksSection } from './HowItWorksSection';
import { InteractivePreviewSection } from './InteractivePreviewSection';
import { MarketIntelligenceSection, ProfitEstimationSection } from './MarketAndProfitSection';
import { RegionalInsightsSection, DashboardPreviewSection, WhyChooseSection } from './RegionalAndPreviewSection';
import { FAQSection } from './FAQSection';
import { FinalCTASection, LandingFooter } from './FinalCTAAndFooter';

interface LandingPageProps {
    onLogin: () => void;
    onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onGetStarted }) => {
    const scrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="landing-page">
            <LandingNavbar onLogin={onLogin} onGetStarted={onGetStarted} />
            <HeroSection onPrimaryCta={onGetStarted} onExplore={() => scrollTo('features')} />
            <CapabilityStrip />
            <ChallengesSection />
            <FeaturesGrid onNavigate={scrollTo} />
            <InteractivePreviewSection />
            <HowItWorksSection />
            <MarketIntelligenceSection />
            <ProfitEstimationSection />
            <RegionalInsightsSection />
            <DashboardPreviewSection onGetStarted={onGetStarted} />
            <WhyChooseSection />
            <FAQSection />
            <FinalCTASection onGetStarted={onGetStarted} onLogin={onLogin} />
            <LandingFooter onGetStarted={onGetStarted} onLogin={onLogin} onNavigate={scrollTo} />
        </div>
    );
};
