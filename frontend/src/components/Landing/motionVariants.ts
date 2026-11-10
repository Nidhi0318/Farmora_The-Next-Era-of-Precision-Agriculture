import type { Variants } from 'framer-motion';

/*
  Shared motion tiers, carried over from Pariskq's site (src/lib/motionVariants.ts):
    - fadeUp / staggerChildren: scroll-triggered content reveal, used across every section below the hero.
    - microHover / microTap: direct interaction feedback on buttons and cards.
  Same timings and easing curve as the source site, so the whole page reads as one motion system.
*/

export const fadeUp: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export const staggerChildren: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

export const microHover = { scale: 1.03, transition: { duration: 0.2, ease: 'easeOut' } };
export const microTap = { scale: 0.96, transition: { duration: 0.12, ease: 'easeOut' } };

export const viewportOnce = { once: true, amount: 0.3 } as const;
