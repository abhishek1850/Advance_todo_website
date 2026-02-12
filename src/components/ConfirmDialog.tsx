import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { playSound } from '../lib/sounds';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Yes',
    cancelText = 'Cancel',
    type = 'danger'
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    const colors = {
        danger: { bg: 'rgba(255, 82, 82, 0.1)', border: 'rgba(255, 82, 82, 0.2)', icon: '#ff5252' },
        warning: { bg: 'rgba(255, 171, 0, 0.1)', border: 'rgba(255, 171, 0, 0.2)', icon: '#ffab00' },
        info: { bg: 'rgba(124, 108, 240, 0.1)', border: 'rgba(124, 108, 240, 0.2)', icon: '#7c6cf0' }
    };
    const color = colors[type];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-backdrop"
                        onClick={onCancel}
                        style={{
                            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex',
                            alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 24,
                                padding: 24,
                                width: '90%',
                                maxWidth: 400,
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                                <div style={{
                                    padding: 12, borderRadius: 16,
                                    background: color.bg, border: `1px solid ${color.border}`,
                                    color: color.icon, display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <AlertTriangle size={24} />
                                </div>
                                <h3 style={{ margin: 0, fontSize: 18 }}>{title}</h3>
                            </div>

                            <p style={{ margin: '0 0 24px 0', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                {message}
                            </p>

                            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => { playSound('click'); onCancel(); }}
                                    className="btn"
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid var(--border-subtle)',
                                        color: 'var(--text-primary)'
                                    }}
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={() => { playSound('click'); onConfirm(); }}
                                    className="btn"
                                    style={{
                                        background: type === 'danger' ? 'var(--accent-danger)' : 'var(--accent-primary)',
                                        color: 'white',
                                        border: 'none'
                                    }}
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
