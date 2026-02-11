import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiProps {
    show: boolean;
    xp: number;
    onDone: () => void;
}

interface Particle {
    x: number; y: number; vx: number; vy: number;
    color: string; size: number; rotation: number; rotationSpeed: number;
    life: number; maxLife: number; shape: 'rect' | 'circle';
}

const COLORS = ['#6c5ce7', '#a29bfe', '#00cec9', '#55efc4', '#fd79a8', '#fdcb6e', '#ff6b6b', '#fff'];

export default function Confetti({ show, xp, onDone }: ConfettiProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particles = useRef<Particle[]>([]);
    const animRef = useRef<number>(0);

    useEffect(() => {
        if (!show) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Create particles
        particles.current = [];
        for (let i = 0; i < 150; i++) {
            particles.current.push({
                x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
                y: window.innerHeight / 2,
                vx: (Math.random() - 0.5) * 20,
                vy: Math.random() * -18 - 5,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                size: Math.random() * 8 + 4,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.3,
                life: 0,
                maxLife: 80 + Math.random() * 40,
                shape: Math.random() > 0.5 ? 'rect' : 'circle',
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let alive = false;

            particles.current.forEach(p => {
                p.life++;
                if (p.life > p.maxLife) return;
                alive = true;

                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.3; // gravity
                p.vx *= 0.99;
                p.rotation += p.rotationSpeed;

                const alpha = 1 - (p.life / p.maxLife);
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.globalAlpha = alpha;
                ctx.fillStyle = p.color;

                if (p.shape === 'rect') {
                    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                } else {
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            });

            if (alive) {
                animRef.current = requestAnimationFrame(animate);
            } else {
                onDone();
            }
        };

        animRef.current = requestAnimationFrame(animate);
        const timeout = setTimeout(onDone, 3000);

        return () => {
            cancelAnimationFrame(animRef.current);
            clearTimeout(timeout);
        };
    }, [show, onDone]);

    return (
        <AnimatePresence>
            {show && (
                <>
                    <canvas ref={canvasRef} className="confetti-canvas" />
                    <motion.div
                        className="celebration-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <motion.div
                            className="celebration-text"
                            initial={{ scale: 0, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0 }}
                            transition={{ type: 'spring', damping: 10, stiffness: 200 }}
                        >
                            🎉 Task Complete!
                            <span className="celebration-xp">+{xp} XP</span>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
