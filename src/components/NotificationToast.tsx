import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { useEffect } from 'react';

export default function NotificationToast() {
    const { notifications, removeNotification } = useStore();

    return (
        <div className="toast-container">
            <AnimatePresence>
                {notifications.map((notification) => (
                    <ToastItem key={notification.id} notification={notification} onDismiss={() => removeNotification(notification.id)} />
                ))}
            </AnimatePresence>
        </div>
    );
}

function ToastItem({ notification, onDismiss }: { notification: { id: string; type: string; title: string; message: string; icon: string }; onDismiss: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 3500);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <motion.div
            className={`toast ${notification.type}`}
            initial={{ opacity: 0, x: 80, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
            <div className="toast-icon">{notification.icon}</div>
            <div className="toast-body">
                <div className="toast-title">{notification.title}</div>
                <div className="toast-message">{notification.message}</div>
            </div>
        </motion.div>
    );
}
