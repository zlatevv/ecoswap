import React, { useState, useEffect } from 'react';
import {
    User, Mail, Shield, Key, Trash2, Eye, EyeOff,
    AlertTriangle, Check, X, ArrowLeft, Moon, Sun
} from 'lucide-react';
import { useDarkMode } from '../components/useDarkMode';

const API = 'http://localhost:8080/api';

function parseJwt(token) {
    try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
}

function authHeaders() {
    const token = sessionStorage.getItem('jwt_token');
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

// ── sub-components ────────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-4 py-4 border-b border-stone-100 dark:border-stone-700 last:border-0">
            <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-700 flex items-center justify-center flex-shrink-0">
                <Icon className="h-4 w-4 text-stone-400 dark:text-stone-400" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wide mb-0.5">{label}</p>
                <p className="text-sm font-medium text-stone-800 dark:text-stone-200 truncate">{value || '—'}</p>
            </div>
            <span className="text-xs text-stone-300 dark:text-stone-600 font-medium">Read only</span>
        </div>
    );
}

function ChangePasswordSection({ username }) {
    const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [show, setShow] = useState({ old: false, new: false, confirm: false });
    const [status, setStatus] = useState(null); // null | 'success' | 'error'
    const [err, setErr] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
            setErr('All fields are required.'); setStatus('error'); return;
        }
        if (form.newPassword !== form.confirmPassword) {
            setErr('New passwords do not match.'); setStatus('error'); return;
        }
        if (form.newPassword.length < 6) {
            setErr('New password must be at least 6 characters.'); setStatus('error'); return;
        }

        setLoading(true); setStatus(null);
        try {
            const res = await fetch(`${API}/auth/changepass`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({
                    username,
                    oldPassword: form.oldPassword,
                    newPassword: form.newPassword,
                }),
            });
            if (!res.ok) throw new Error('Current password is incorrect.');
            setStatus('success');
            setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (e) {
            setErr(e.message); setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    const PasswordInput = ({ field, label, showKey }) => (
        <div>
            <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1.5">{label}</label>
            <div className="relative">
                <input
                    type={show[showKey] ? 'text' : 'password'}
                    value={form[field]}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    className="w-full px-4 py-2.5 pr-10 bg-stone-100 dark:bg-stone-700 dark:text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="••••••••"
                />
                <button
                    type="button"
                    onClick={() => setShow(s => ({ ...s, [showKey]: !s[showKey] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                >
                    {show[showKey] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                    <Key className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                    <h3 className="font-bold text-stone-900 dark:text-white text-base">Change Password</h3>
                    <p className="text-xs text-stone-400 dark:text-stone-500">Update your account password</p>
                </div>
            </div>

            <div className="space-y-4">
                <PasswordInput field="oldPassword" label="Current Password" showKey="old" />
                <PasswordInput field="newPassword" label="New Password" showKey="new" />
                <PasswordInput field="confirmPassword" label="Confirm New Password" showKey="confirm" />
            </div>

            {status === 'success' && (
                <div className="mt-4 flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-2.5 rounded-xl">
                    <Check className="h-4 w-4" /> Password updated successfully.
                </div>
            )}
            {status === 'error' && (
                <div className="mt-4 flex items-center gap-2 text-sm text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-4 py-2.5 rounded-xl">
                    <X className="h-4 w-4" /> {err}
                </div>
            )}

            <button
                onClick={handleSubmit}
                disabled={loading}
                className="mt-5 w-full py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60"
            >
                {loading ? 'Updating...' : 'Update Password'}
            </button>
        </div>
    );
}

function DeleteAccountSection({ username }) {
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');
    const [showPanel, setShowPanel] = useState(false);

    const handleDelete = async () => {
        if (confirm !== username) {
            setErr(`Type your username "${username}" to confirm.`); return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API}/auth/delete`, {
                method: 'DELETE',
                headers: authHeaders(),
                body: JSON.stringify(username),
            });
            if (!res.ok) throw new Error('Failed to delete account.');
            sessionStorage.removeItem('jwt_token');
            window.location.href = '/register';
        } catch (e) {
            setErr(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-stone-800 rounded-2xl border border-rose-200 dark:border-rose-900/50 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
                    <Trash2 className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                    <h3 className="font-bold text-stone-900 dark:text-white text-base">Delete Account</h3>
                    <p className="text-xs text-stone-400 dark:text-stone-500">Permanently remove your account and all data</p>
                </div>
            </div>

            {!showPanel ? (
                <button
                    onClick={() => setShowPanel(true)}
                    className="w-full py-2.5 border border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-semibold hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                >
                    Delete my account
                </button>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-start gap-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4">
                        <AlertTriangle className="h-4 w-4 text-rose-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                            This action is <strong>irreversible</strong>. All your listings and data will be permanently deleted.
                            Type your username <strong>{username}</strong> to confirm.
                        </p>
                    </div>
                    <input
                        value={confirm}
                        onChange={e => { setConfirm(e.target.value); setErr(''); }}
                        placeholder={`Type "${username}" to confirm`}
                        className="w-full px-4 py-2.5 bg-stone-100 dark:bg-stone-700 dark:text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-400"
                    />
                    {err && <p className="text-xs text-rose-600 dark:text-rose-400">{err}</p>}
                    <div className="flex gap-3">
                        <button
                            onClick={() => { setShowPanel(false); setConfirm(''); setErr(''); }}
                            className="flex-1 py-2.5 border border-stone-200 dark:border-stone-600 text-stone-600 dark:text-stone-300 rounded-xl text-sm font-semibold hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition-colors disabled:opacity-60"
                        >
                            {loading ? 'Deleting...' : 'Delete Account'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── main ──────────────────────────────────────────────────────────────────────

export default function Settings({ onBack }) {
    const [isDark, setIsDark] = useDarkMode();
    const token = sessionStorage.getItem('jwt_token');
    const jwt = parseJwt(token);
    const username = jwt?.sub || 'User';
    const userId = jwt?.userId;

    const [profilePic, setProfilePic] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!userId) return;
            try {
                const res = await fetch(`${API}/auth/${userId}`, { headers: authHeaders() });
                if (res.ok) {
                    const data = await res.json();
                    setProfilePic(data.profilePictureURL);
                }
            } catch (e) {
                console.error("Failed to load profile pic in settings:", e);
            }
        };
        fetchUserData();
    }, [userId]);

    const userInfo = [
        { icon: User,   label: 'Username',     value: username },
        { icon: Mail,   label: 'Role',         value: jwt?.role },
        { icon: Shield, label: 'Account ID',   value: jwt?.userId ? `#${jwt.userId}` : '—' },
    ];

    return (
        <div className="flex-1 overflow-auto p-8 max-w-2xl mx-auto w-full">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="w-9 h-9 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 text-stone-500 dark:text-stone-400" />
                    </button>
                )}
                <div>
                    <h1 className="text-3xl font-bold text-stone-900 dark:text-white tracking-tight">Settings</h1>
                    <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">Manage your account preferences</p>
                </div>
            </div>

            <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-700 flex items-center justify-center">
                            {isDark ? <Moon className="h-4 w-4 text-stone-400 dark:text-stone-300" /> : <Sun className="h-4 w-4 text-amber-500" />}
                        </div>
                        <div>
                            <h3 className="font-bold text-stone-900 dark:text-white text-base">Dark Mode</h3>
                            <p className="text-xs text-stone-400 dark:text-stone-500">Switch between light and dark theme</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsDark(prev => !prev)}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                            isDark ? 'bg-emerald-500' : 'bg-stone-200 dark:bg-stone-600'
                        }`}
                    >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                            isDark ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                    </button>
                </div>
            </div>

            <br/>

            <div className="space-y-6">
                {/* Profile Info */}
                <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm p-6">
                    <div className="flex items-center gap-4 mb-6">
                        {profilePic ? (
                            <img
                                src={profilePic}
                                alt="Profile"
                                className="w-16 h-16 rounded-2xl object-cover shadow-sm border border-stone-100 dark:border-stone-700"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-bold text-2xl shadow-sm">
                                {username.charAt(0).toUpperCase()}
                            </div>
                        )}

                        <div>
                            <h2 className="text-xl font-bold text-stone-900 dark:text-white">{username}</h2>
                            <span className="inline-block mt-1 text-xs font-semibold px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-lg">
                                {jwt?.role || 'USER'}
                            </span>
                        </div>
                    </div>

                    <div className="divide-y divide-stone-100 dark:divide-stone-700">
                        {userInfo.map((row, i) => (
                            <InfoRow key={i} {...row} />
                        ))}
                    </div>
                </div>

                <ChangePasswordSection username={username} />
                <DeleteAccountSection username={username} />
            </div>
        </div>
    );
}