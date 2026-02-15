import React from 'react';
import { motion } from 'framer-motion';

// ============================================
// Premium Weather SVGs
// ============================================
export const SunSVG = ({ size = 28 }: { size?: number }): React.JSX.Element => (
    <motion.svg
        width={size} height={size} viewBox="0 0 24 24" fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    >
        <defs>
            <radialGradient id="sunGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFEB3B" />
                <stop offset="100%" stopColor="#F57C00" />
            </radialGradient>
            <filter id="sunGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>
        <circle cx="12" cy="12" r="5" fill="url(#sunGradient)" filter="url(#sunGlow)" />
        <g stroke="url(#sunGradient)" strokeWidth="2" strokeLinecap="round" filter="url(#sunGlow)">
            {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
                <motion.line
                    key={angle}
                    x1="12" y1="3" x2="12" y2="5"
                    transform={`rotate(${angle} 12 12)`}
                />
            ))}
        </g>
    </motion.svg>
);

export const CloudSunSVG = ({ size = 28 }: { size?: number }): React.JSX.Element => (
    <span style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', verticalAlign: 'middle' }}>
        <motion.div
            style={{ position: 'absolute', top: '10%', right: '10%' }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
            <SunSVG size={size * 0.75} />
        </motion.div>
        <motion.svg
            width={size * 0.9} height={size * 0.9} viewBox="0 0 24 24" fill="none"
            style={{ position: 'absolute', bottom: '5%', left: '5%', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
            animate={{ y: [-1, 1, -1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
            <defs>
                <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#E0E0E0" />
                </linearGradient>
            </defs>
            <path
                d="M17.5 19c3.037 0 5.5-2.463 5.5-5.5 0-2.903-2.247-5.281-5.1-5.485C17.433 4.214 14.167 1 10.156 1 6.556 1 3.52 3.655 3.056 7.156 1.306 7.844 0 9.531 0 11.5c0 2.485 2.015 4.5 4.5 4.5h1c.5 0 .5.5 1 .5 1 0 1 2.5 3 2.5h8z"
                fill="url(#cloudGrad)"
                fillOpacity="0.95"
            />
        </motion.svg>
    </span>
);

export type WeatherType = 'sun' | 'cloud-sun' | 'moon' | 'sunset' | 'sunrise' | 'zap';

export function WeatherIcon({ type, size = 28 }: { type: WeatherType; size?: number }): React.JSX.Element {
    switch (type) {
        case 'sun': return <SunSVG size={size} />;
        case 'cloud-sun': return <CloudSunSVG size={size} />;
        case 'moon': return <span style={{ fontSize: size * 0.8 }}>🌙</span>;
        case 'sunrise': return <span style={{ fontSize: size * 0.8 }}>🌅</span>;
        case 'sunset': return <span style={{ fontSize: size * 0.8 }}>🌆</span>;
        case 'zap': return <span style={{ fontSize: size * 0.8 }}>⚡</span>;
        default: return <SunSVG size={size} />;
    }
}

// Get time-appropriate greeting with motivational context
export function getSmartGreeting(name: string): { text: string; type: WeatherType } {
    const hour = new Date().getHours();
    const firstName = name?.split(' ')[0] || 'Champion';

    if (hour < 6) return { text: `Burning the midnight oil, ${firstName}?`, type: 'moon' };
    if (hour < 9) return { text: `Early bird ${firstName}! Best time to focus.`, type: 'sunrise' };
    if (hour < 12) return { text: `Good morning, ${firstName}! Let's be productive.`, type: 'sun' };
    if (hour < 14) return { text: `Afternoon focus time, ${firstName}!`, type: 'cloud-sun' };
    if (hour < 17) return { text: `Power through, ${firstName}!`, type: 'zap' };
    if (hour < 20) return { text: `Evening push, ${firstName}!`, type: 'sunset' };
    return { text: `Still going strong, ${firstName}!`, type: 'moon' };
}
