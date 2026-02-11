import { motion } from 'framer-motion';
import { useStore } from '../store';

export default function XPBar() {
    const { profile } = useStore();
    const progress = (profile.xp / profile.xpToNextLevel) * 100;

    return (
        <div className="xp-bar-container">
            <span className="level-badge">LVL {profile.level}</span>
            <div className="xp-bar">
                <motion.div
                    className="xp-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                />
            </div>
            <span className="xp-text">{profile.xp}/{profile.xpToNextLevel}</span>
        </div>
    );
}
