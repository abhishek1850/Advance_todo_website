import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Target, Sparkles, TrendingUp, Zap, Clock, ArrowRight } from 'lucide-react';
import { useStore } from '../store';

// ============================================
// Motivational Quotes — Indian Icons & Legends
// ============================================
const MOTIVATIONAL_QUOTES = [
    // Swami Vivekananda
    { text: "Arise, awake, and stop not till the goal is reached.", author: "Swami Vivekananda" },
    { text: "In a conflict between the heart and the brain, follow your heart.", author: "Swami Vivekananda" },
    { text: "All the powers in the universe are already ours. It is we who have put our hands before our eyes and cry that it is dark.", author: "Swami Vivekananda" },
    { text: "Take risks in your life. If you win, you can lead; if you lose, you can guide.", author: "Swami Vivekananda" },
    { text: "You cannot believe in God until you believe in yourself.", author: "Swami Vivekananda" },
    { text: "The greatest sin is to think that you are weak.", author: "Swami Vivekananda" },
    { text: "Talk to yourself once in a day, otherwise you may miss meeting an excellent person in this world.", author: "Swami Vivekananda" },

    // Shwetabh Gangwar
    { text: "Don't chase happiness, chase competence. Happiness will follow.", author: "Shwetabh Gangwar" },
    { text: "Your self-worth should come from within, not from validation of others.", author: "Shwetabh Gangwar" },
    { text: "Stop trying to impress people. Work on yourself for yourself.", author: "Shwetabh Gangwar" },
    { text: "The problem is not the problem. Your reaction to the problem is the problem.", author: "Shwetabh Gangwar" },
    { text: "Be so busy improving yourself that you have no time to criticize others.", author: "Shwetabh Gangwar" },

    // APJ Abdul Kalam
    { text: "Dream is not that which you see while sleeping, it is something that does not let you sleep.", author: "Dr. APJ Abdul Kalam" },
    { text: "If you fail, never give up because FAIL means First Attempt In Learning.", author: "Dr. APJ Abdul Kalam" },
    { text: "Don't take rest after your first victory because if you fail in the second, more lips are waiting to say that your first victory was just luck.", author: "Dr. APJ Abdul Kalam" },
    { text: "All of us do not have equal talent. But all of us have an equal opportunity to develop our talents.", author: "Dr. APJ Abdul Kalam" },
    { text: "Man needs his difficulties because they are necessary to enjoy success.", author: "Dr. APJ Abdul Kalam" },

    // Ratan Tata
    { text: "I don't believe in taking right decisions. I take decisions and then make them right.", author: "Ratan Tata" },
    { text: "If you want to walk fast, walk alone. But if you want to walk far, walk together.", author: "Ratan Tata" },
    { text: "Ups and downs in life are very important to keep us going, because a straight line even in an ECG means we are not alive.", author: "Ratan Tata" },
    { text: "None can destroy iron, but its own rust can. Likewise, none can destroy a person, but their own mindset can.", author: "Ratan Tata" },

    // Chanakya
    { text: "A person should not be too honest. Straight trees are cut first and honest people are screwed first.", author: "Chanakya" },
    { text: "Education is the best friend. An educated person is respected everywhere.", author: "Chanakya" },
    { text: "Before you start some work, always ask yourself three questions – Why am I doing it, what the results might be, and will I be successful.", author: "Chanakya" },
    { text: "The world's biggest power is the youth and beauty of a woman.", author: "Chanakya" },
    { text: "Once you start working on something, don't be afraid of failure and don't abandon it.", author: "Chanakya" },

    // Dhirubhai Ambani
    { text: "If you don't build your dream, someone else will hire you to help them build theirs.", author: "Dhirubhai Ambani" },
    { text: "Between your preparation and your ambition, there is no gap that hard work cannot fill.", author: "Dhirubhai Ambani" },
    { text: "Think big, think fast, think ahead. Ideas are no one's monopoly.", author: "Dhirubhai Ambani" },

    // Sadhguru
    { text: "The only thing that stands between you and your well-being is a simple fact: you have allowed your thoughts to take instruction from you.", author: "Sadhguru" },
    { text: "If you resist change, you resist life.", author: "Sadhguru" },
    { text: "Do not try to fix whatever comes in your life. Fix yourself in such a way that whatever comes, you will be fine.", author: "Sadhguru" },

    // Rabindranath Tagore
    { text: "You can't cross the sea merely by standing and staring at the water.", author: "Rabindranath Tagore" },
    { text: "If you cry because the sun has gone out of your life, your tears will prevent you from seeing the stars.", author: "Rabindranath Tagore" },
    { text: "Faith is the bird that feels the light when the dawn is still dark.", author: "Rabindranath Tagore" },

    // Sardar Vallabhbhai Patel
    { text: "Every citizen of India must remember that he is an Indian and he has every right in this country but with certain duties.", author: "Sardar Vallabhbhai Patel" },
    { text: "Manpower without unity is not a strength unless it is harmonized and united properly, then it becomes a spiritual power.", author: "Sardar Vallabhbhai Patel" },

    // Bhagavad Gita
    { text: "You have the right to work, but never to the fruit of the work.", author: "Bhagavad Gita" },
    { text: "Change is the law of the universe. You can be a millionaire or a pauper in an instant.", author: "Bhagavad Gita" },
    { text: "Set thy heart upon thy work, but never on its reward.", author: "Bhagavad Gita" },

    // Narayan Murthy
    { text: "Progress is often equal to the difference between mind and mindset.", author: "N. R. Narayana Murthy" },
    { text: "Growth is painful. Change is painful. But nothing is as painful as staying stuck somewhere you don't belong.", author: "N. R. Narayana Murthy" },

    // Sudha Murty
    { text: "Money can buy many things, but it cannot buy your own self-respect.", author: "Sudha Murty" },
    { text: "The real wealth of a person lies in their kindness and deeds, not in possessions.", author: "Sudha Murty" },
];

// Get a deterministic daily quote index based on the date
// Ensures each day of the year gets a unique quote, cycling through the collection
function getDailyQuoteIndex(): number {
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
    return dayOfYear % MOTIVATIONAL_QUOTES.length;
}

// Context-aware motivational messages
function getContextMessage(streak: number, totalCompleted: number, todayCompleted: number, todayTotal: number): string {
    if (todayTotal === 0) return "Add your first task and begin your journey! 🚀";
    if (todayCompleted === todayTotal && todayTotal > 0) return "🎉 All tasks complete! You're unstoppable!";
    if (streak >= 30) return "🔥 30+ day streak! You are a legend!";
    if (streak >= 7) return `🔥 ${streak}-day streak! Incredible consistency!`;
    if (streak >= 3) return `Nice ${streak}-day streak! Keep the momentum!`;
    if (totalCompleted >= 100) return "Century club member! 💯 Keep crushing it!";
    if (totalCompleted >= 50) return "50+ tasks conquered! You're on fire! 🚀";
    if (todayCompleted > 0) return `${todayCompleted}/${todayTotal} done today — you've got this!`;
    return "A productive day awaits you. Let's go! ⚡";
}

// ============================================
// Premium Weather SVGs
// ============================================
const SunSVG = ({ size = 28 }: { size?: number }) => (
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
                <line
                    key={angle}
                    x1="12" y1="3" x2="12" y2="5"
                    transform={`rotate(${angle} 12 12)`}
                />
            ))}
        </g>
    </motion.svg>
);

const CloudSunSVG = ({ size = 28 }: { size?: number }) => (
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

// ============================================
// Weather Icons & Display
// ============================================

export type WeatherType = 'sun' | 'cloud-sun' | 'moon' | 'sunset' | 'sunrise' | 'zap';

export function WeatherIcon({ type, size = 28 }: { type: WeatherType; size?: number }) {
    switch (type) {
        case 'sun': return <SunSVG size={size} />;
        case 'cloud-sun': return <CloudSunSVG size={size} />;
        case 'moon': return <span style={{ fontSize: size * 0.8 }}>🌙</span>; // Fallback or implement MoonSVG
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

// ============================================
// Daily Motivation Widget
// ============================================
export function DailyMotivation() {
    const { profile, getTodaysTasks, getStreak } = useStore();
    const todayTasks = getTodaysTasks();
    const todayCompleted = todayTasks.filter(t => t.isCompleted).length;
    const todayTotal = todayTasks.length;
    const streak = getStreak();

    const quote = MOTIVATIONAL_QUOTES[getDailyQuoteIndex()];
    const contextMessage = getContextMessage(streak, profile.totalTasksCompleted, todayCompleted, todayTotal);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                background: 'linear-gradient(135deg, rgba(124,108,240,0.08) 0%, rgba(0,212,207,0.05) 100%)',
                border: '1px solid rgba(124,108,240,0.15)',
                borderRadius: 20,
                padding: '24px 28px',
                marginBottom: 24,
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Decorative sparkles */}
            <div style={{
                position: 'absolute', top: -20, right: -20,
                width: 100, height: 100,
                background: 'radial-gradient(circle, rgba(124,108,240,0.15) 0%, transparent 70%)',
                borderRadius: '50%',
            }} />
            <div style={{
                position: 'absolute', bottom: -30, left: -10,
                width: 80, height: 80,
                background: 'radial-gradient(circle, rgba(0,212,207,0.1) 0%, transparent 70%)',
                borderRadius: '50%',
            }} />

            {/* Context message */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                marginBottom: 14, fontSize: 14, fontWeight: 600,
                color: 'var(--accent-primary)',
            }}>
                <Sparkles size={16} />
                {contextMessage}
            </div>

            {/* Quote */}
            <div style={{
                fontSize: 16, lineHeight: 1.7,
                color: 'var(--text-primary)',
                fontStyle: 'italic',
                marginBottom: 10,
                position: 'relative',
                paddingLeft: 16,
                borderLeft: '3px solid rgba(124,108,240,0.3)',
            }}>
                "{quote.text}"
            </div>
            <div style={{
                fontSize: 13, color: 'var(--text-tertiary)',
                fontWeight: 500,
                paddingLeft: 16,
            }}>
                — {quote.author}
            </div>
        </motion.div>
    );
}

// ============================================
// Streak Milestone Celebration
// ============================================
export function StreakMilestone() {
    const { profile } = useStore();
    const [dismissed, setDismissed] = useState(false);

    const milestones = [3, 7, 14, 21, 30, 50, 100, 200, 365];
    const currentMilestone = milestones.find(m => m === profile.currentStreak);

    if (!currentMilestone || dismissed) return null;

    const celebrations: Record<number, { emoji: string; title: string; message: string }> = {
        3: { emoji: '🌱', title: 'Sprout!', message: '3-day streak! A habit is forming.' },
        7: { emoji: '🔥', title: 'Week Warrior!', message: '7-day streak! You\'re on fire!' },
        14: { emoji: '⚡', title: 'Fortnight Force!', message: '14 days! Incredible consistency!' },
        21: { emoji: '🏆', title: 'Habit Formed!', message: '21 days! Science says this is a habit now!' },
        30: { emoji: '👑', title: 'Monthly Master!', message: '30-day streak! You are unstoppable!' },
        50: { emoji: '💎', title: 'Diamond Discipline!', message: '50 days! You\'re in the top 1%!' },
        100: { emoji: '🌟', title: 'Centurion!', message: '100-day streak! Legendary status!' },
        200: { emoji: '🦁', title: 'Unstoppable Force!', message: '200 days! Nothing can stop you!' },
        365: { emoji: '🎊', title: 'Year of Excellence!', message: '365 days! A full year! You are extraordinary!' },
    };

    const celebration = celebrations[currentMilestone];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                style={{
                    background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 87, 34, 0.1) 100%)',
                    border: '1px solid rgba(255, 193, 7, 0.25)',
                    borderRadius: 20,
                    padding: '20px 24px',
                    marginBottom: 24,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                }}
            >
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ fontSize: 40, lineHeight: 1 }}
                >
                    {celebration.emoji}
                </motion.div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent-warning)' }}>
                        {celebration.title}
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2 }}>
                        {celebration.message}
                    </div>
                </div>
                <button
                    onClick={() => setDismissed(true)}
                    style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 8, padding: '6px 12px', color: 'var(--text-tertiary)',
                        cursor: 'pointer', fontSize: 12,
                    }}
                >
                    Dismiss
                </button>
            </motion.div>
        </AnimatePresence>
    );
}

// ============================================
// Productivity Tip of the Day
// ============================================
const PRODUCTIVITY_TIPS = [
    { icon: <Target size={16} />, tip: "Start with your hardest task first (Eat the Frog method)." },
    { icon: <Clock size={16} />, tip: "Use the Pomodoro technique: 25 min work + 5 min break." },
    { icon: <TrendingUp size={16} />, tip: "Break big tasks into smaller, actionable subtasks." },
    { icon: <Zap size={16} />, tip: "Batch similar tasks together for better focus." },
    { icon: <Flame size={16} />, tip: "Review your goals every morning for clarity." },
    { icon: <ArrowRight size={16} />, tip: "Use the 2-minute rule: if it takes less than 2 min, do it now." },
    { icon: <Target size={16} />, tip: "Set 3 Most Important Tasks (MITs) each morning." },
    { icon: <Clock size={16} />, tip: "Schedule deep work during your peak energy hours." },
];

export function ProductivityTip() {
    const tipIndex = Math.floor(new Date().getDate()) % PRODUCTIVITY_TIPS.length;
    const tip = PRODUCTIVITY_TIPS[tipIndex];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12,
                padding: '10px 16px',
                marginTop: 16,
                fontSize: 13,
                color: 'var(--text-secondary)',
            }}
        >
            <div style={{ color: 'var(--accent-primary)', flexShrink: 0 }}>{tip.icon}</div>
            <div>💡 <strong>Tip:</strong> {tip.tip}</div>
        </motion.div>
    );
}

// ============================================
// Session Idle Handler (auto-lock after inactivity)
// ============================================
export function useSessionTimeout(timeoutMs: number = 30 * 60 * 1000) { // 30 minutes
    const { user } = useStore();

    useEffect(() => {
        if (!user) return;

        let timeoutId: ReturnType<typeof setTimeout>;

        const resetTimer = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                // Sign out after inactivity
                import('../lib/firebase').then(({ auth }) => {
                    import('firebase/auth').then(({ signOut }) => {
                        signOut(auth);
                    });
                });
            }, timeoutMs);
        };

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event => window.addEventListener(event, resetTimer));
        resetTimer();

        return () => {
            clearTimeout(timeoutId);
            events.forEach(event => window.removeEventListener(event, resetTimer));
        };
    }, [user, timeoutMs]);
}


