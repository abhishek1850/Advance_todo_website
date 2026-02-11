import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, LogOut, Save, Loader2 } from 'lucide-react';
import { useStore } from '../store';
import { auth } from '../lib/firebase';
import { updateProfile, signOut } from 'firebase/auth';

export default function ProfileView() {
    const { user, setUser } = useStore();
    const [name, setName] = useState(user?.displayName || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        setMessage('');
        try {
            await updateProfile(user, { displayName: name });
            setUser({ ...user, displayName: name });
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error(error);
            setMessage('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setUser(null);
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    if (!user) return null;

    return (
        <div className="view-container">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{ maxWidth: 600, margin: '0 auto' }}
            >
                <div className="card" style={{ padding: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
                        <div style={{
                            width: 80, height: 80, borderRadius: '50%',
                            background: 'var(--gradient-primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 32, fontWeight: 'bold', color: 'white',
                            boxShadow: '0 8px 32px rgba(124,108,240,0.3)'
                        }}>
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                (name?.[0] || user.email?.[0] || 'U').toUpperCase()
                            )}
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: 24 }}>{user.displayName || 'User'}</h2>
                            <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>{user.email}</p>
                        </div>
                    </div>

                    <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <User size={16} /> Display Name
                            </label>
                            <input
                                className="form-input"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Mail size={16} /> Email
                            </label>
                            <input
                                className="form-input"
                                type="email"
                                value={user.email || ''}
                                disabled
                                style={{ opacity: 0.7, cursor: 'not-allowed' }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Calendar size={16} /> Member Since
                            </label>
                            <input
                                className="form-input"
                                type="text"
                                value={user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown'}
                                disabled
                                style={{ opacity: 0.7, cursor: 'not-allowed' }}
                            />
                        </div>

                        {message && (
                            <div style={{
                                padding: '10px 14px', borderRadius: 'var(--radius-md)',
                                background: message.includes('Failed') ? 'rgba(255,107,107,0.1)' : 'rgba(0,214,143,0.1)',
                                color: message.includes('Failed') ? 'var(--accent-danger)' : 'var(--accent-success)',
                                fontSize: 13, textAlign: 'center'
                            }}>
                                {message}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                            >
                                {loading ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
                                Update Profile
                            </button>

                            <button
                                type="button"
                                className="btn"
                                onClick={handleLogout}
                                style={{
                                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    background: 'rgba(255,107,107,0.1)', color: 'var(--accent-danger)', border: '1px solid rgba(255,107,107,0.2)'
                                }}
                            >
                                <LogOut size={18} />
                                Log Out
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
