import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Flame, Coffee } from 'lucide-react';

interface TimerProps {
    duration?: number; // In minutes, default 25
    onComplete?: () => void;
    className?: string;
}

export default function FocusTimer({ duration = 25, onComplete, className = '' }: TimerProps) {
    const [focusDuration, setFocusDuration] = useState(duration);
    const [timeLeft, setTimeLeft] = useState(duration * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'focus' | 'break'>('focus');

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            if (onComplete) onComplete();
            const audio = new Audio('/notification.mp3');
            audio.play().catch(() => { });
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, onComplete]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === 'focus' ? focusDuration * 60 : 5 * 60);
    };

    const cycleDuration = () => {
        if (isActive || mode === 'break') return;
        const presets = [15, 25, 30, 45, 60, 90];
        // Find current index or default to 25's index
        let currentIndex = presets.indexOf(focusDuration);
        if (currentIndex === -1) currentIndex = 1; // Default to 25 if custom

        const nextIndex = (currentIndex + 1) % presets.length;
        const nextDuration = presets[nextIndex];

        setFocusDuration(nextDuration);
        setTimeLeft(nextDuration * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const switchMode = () => {
        const newMode = mode === 'focus' ? 'break' : 'focus';
        setMode(newMode);
        setTimeLeft(newMode === 'focus' ? focusDuration * 60 : 5 * 60);
        setIsActive(false);
    };

    return (
        <div
            className={`focus-timer-simple ${className}`}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '6px 12px',
                borderRadius: 20,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(8px)',
                height: 40
            }}
        >
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={switchMode}
                title={mode === 'focus' ? "Switch to Break" : "Switch to Focus"}
                style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: mode === 'focus' ? 'var(--accent-primary)' : 'var(--accent-success)',
                    padding: 4, display: 'flex', alignItems: 'center'
                }}
            >
                {mode === 'focus' ? <Flame size={16} fill="currentColor" fillOpacity={0.2} /> : <Coffee size={16} />}
            </motion.button>

            <div
                onClick={cycleDuration}
                title={!isActive && mode === 'focus' ? "Click to change duration (15, 25, 30, 45, 60, 90 min)" : ""}
                style={{
                    fontVariantNumeric: 'tabular-nums',
                    fontWeight: 600,
                    fontSize: 14,
                    width: 44,
                    textAlign: 'center',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    cursor: !isActive && mode === 'focus' ? 'pointer' : 'default',
                    userSelect: 'none'
                }}
            >
                {formatTime(timeLeft)}
            </div>

            <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }}></div>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTimer}
                style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-primary)',
                    padding: 4, display: 'flex', alignItems: 'center'
                }}
            >
                {isActive ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
            </motion.button>

            <motion.button
                whileHover={{ scale: 1.1, rotate: -45 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetTimer}
                style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-tertiary)',
                    padding: 4, display: 'flex', alignItems: 'center'
                }}
            >
                <RotateCcw size={14} />
            </motion.button>
        </div>
    );
}
