import React from 'react';
import logoMark from '../assets/brand/agriveda-mark.png';
import logoFull from '../assets/brand/agriveda-logo.png';

export const BRAND_NAME = 'Farmora';

export const BrandLockup: React.FC<{ size?: number; light?: boolean; className?: string }> = ({ size = 36, light = false, className = '' }) => (
    <span className={`brand-lockup${light ? ' brand-lockup-light' : ''} ${className}`.trim()}>
        <img src={logoMark} alt="" style={{ height: size }} className="brand-mark" />
        <span className="brand-wordmark" style={{ fontSize: size * 0.62 }}>
            <span className="brand-agri">Farm</span><span className="brand-veda">ora</span>
        </span>
    </span>
);

export const BrandFullLogo: React.FC<{ width?: number; className?: string }> = ({ width = 220, className = '' }) => (
    <img src={logoFull} alt={BRAND_NAME} style={{ width }} className={`brand-full-logo ${className}`.trim()} />
);
