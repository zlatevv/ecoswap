import React, { useState, useEffect, useCallback } from 'react';
import {
    Leaf, LayoutDashboard, Tag, RefreshCw, TrendingUp, Award,
    LogOut, Plus, MapPin, Search, X, ChevronDown,
    PackageOpen, Trash2, DollarSign, ImagePlus, ChevronLeft, ChevronRight, Shield, Bell
} from 'lucide-react';
import { Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Settings from './Settings';
import SwapRequests from './SwapRequests';
import AdminPanel from './AdminPanel.jsx';

function parseJwt(token) {
    try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
}

const API = '/api';

function authHeaders() {
    const token = sessionStorage.getItem('jwt_token');
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

function authHeadersNoContentType() {
    const token = sessionStorage.getItem('jwt_token');
    return { Authorization: `Bearer ${token}` };
}

function StatCard({ title, value, icon: Icon, color, bg }) {
    return (
        <div className="bg-white dark:bg-stone-800 p-6 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm flex items-center space-x-4">
            <div className={`p-4 rounded-xl ${bg}`}>
                <Icon className={`h-6 w-6 ${color}`} />
            </div>
            <div>
                <p className="text-sm font-semibold text-stone-500 dark:text-stone-400">{title}</p>
                <p className="text-2xl font-bold text-stone-900 dark:text-white mt-0.5">{value}</p>
            </div>
        </div>
    );
}

function ProductCard({ item, onDelete, showDelete }) {
    const navigate = useNavigate();
    const [imgIndex, setImgIndex] = useState(0);

    const images = item.imageUrls || [];
    const hasImages = images.length > 0;

    const nextImg = (e) => { e.stopPropagation(); setImgIndex((i) => (i + 1) % images.length); };
    const prevImg = (e) => { e.stopPropagation(); setImgIndex((i) => (i - 1 + images.length) % images.length); };

    return (
        <div
            onClick={() => navigate(`/products/${item.id}`)}
            className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col relative group/card"
        >
            <div className="relative h-44 bg-stone-100 dark:bg-stone-700 flex items-center justify-center overflow-hidden group/carousel">
                {hasImages ? (
                    <>
                        <img
                            src={images[imgIndex]}
                            alt={`${item.productName}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                        />
                        {images.length > 1 && (
                            <>
                                <button onClick={prevImg} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur rounded-full p-1 shadow-sm opacity-0 group-hover/carousel:opacity-100 hover:bg-white hover:text-emerald-600 transition-all text-stone-600 z-10">
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button onClick={nextImg} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur rounded-full p-1 shadow-sm opacity-0 group-hover/carousel:opacity-100 hover:bg-white hover:text-emerald-600 transition-all text-stone-600 z-10">
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10 bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm">
                                    {images.map((_, idx) => (
                                        <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === imgIndex ? 'w-3 bg-white' : 'w-1.5 bg-white/60'}`} />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <PackageOpen className="h-12 w-12 text-stone-300 dark:text-stone-500" />
                )}
                {showDelete && (
                    <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="absolute top-2 right-2 bg-white/90 backdrop-blur rounded-lg p-1.5 shadow hover:bg-rose-50 hover:text-rose-600 transition-colors z-20">
                        <Trash2 className="h-4 w-4" />
                    </button>
                )}
            </div>
            <div className="p-4 flex-1 flex flex-col z-20 bg-white dark:bg-stone-800">
                <h3 className="font-bold text-stone-900 dark:text-white text-base mb-1 line-clamp-1">{item.productName}</h3>
                <p className="text-stone-500 dark:text-stone-400 text-xs line-clamp-2 mb-3">{item.productDescription}</p>
                <div className="mt-auto flex items-center justify-between">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5" />{Number(item.productPrice).toFixed(2)}
                    </span>
                    {item.user && (
                        <span className="text-xs text-stone-400 dark:text-stone-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />{item.user.username || 'Anonymous'}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

function ListItemModal({ onClose, onSuccess }) {
    const [form, setForm] = useState({ productName: '', productDescription: '', productPrice: '' });
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        setImageFiles(prev => [...prev, ...files]);
        setImagePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    };

    const removeImage = (indexToRemove) => {
        setImageFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
        setImagePreviews(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleSubmit = async () => {
        if (!form.productName || !form.productPrice) { setErr('Name and price are required.'); return; }
        setLoading(true); setErr(null);
        try {
            const res = await fetch(`${API}/products`, {
                method: 'POST', headers: authHeaders(),
                body: JSON.stringify({ ...form, productPrice: parseFloat(form.productPrice) }),
            });
            if (!res.ok) throw new Error(await res.text());
            const created = await res.json();
            if (imageFiles.length > 0 && created.id) {
                const formData = new FormData();
                imageFiles.forEach(file => formData.append('files', file));
                await fetch(`${API}/products/${created.id}/images`, {
                    method: 'POST', headers: authHeadersNoContentType(), body: formData,
                });
            }
            onSuccess();
        } catch (e) {
            setErr(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-stone-900 dark:text-white">List an Item</h2>
                    <button onClick={onClose} className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1.5">Photos</label>
                        <div className="grid grid-cols-3 gap-3 mb-3">
                            {imagePreviews.map((preview, index) => (
                                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-stone-200 dark:border-stone-600 group">
                                    <img src={preview} alt="" className="w-full h-full object-cover" />
                                    <button onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-rose-500 transition-all">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                            {imagePreviews.length < 6 && (
                                <label className="cursor-pointer aspect-square rounded-xl border-2 border-dashed border-stone-200 dark:border-stone-600 hover:border-emerald-400 flex flex-col items-center justify-center text-stone-400 transition-colors bg-stone-50 dark:bg-stone-700">
                                    <ImagePlus className="h-6 w-6 mb-1" />
                                    <span className="text-[10px] font-medium text-center px-2">Add Photo</span>
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                                </label>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1.5">Product Name *</label>
                        <input className="w-full px-4 py-2.5 bg-stone-100 dark:bg-stone-700 dark:text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g. Vintage Denim Jacket" value={form.productName} onChange={e => setForm(f => ({ ...f, productName: e.target.value }))} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1.5">Description</label>
                        <textarea rows={3} className="w-full px-4 py-2.5 bg-stone-100 dark:bg-stone-700 dark:text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none" placeholder="Describe the item, condition, etc." value={form.productDescription} onChange={e => setForm(f => ({ ...f, productDescription: e.target.value }))} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1.5">Price (USD) *</label>
                        <input type="number" min="0" step="0.01" className="w-full px-4 py-2.5 bg-stone-100 dark:bg-stone-700 dark:text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="0.00" value={form.productPrice} onChange={e => setForm(f => ({ ...f, productPrice: e.target.value }))} />
                    </div>
                </div>

                {err && <p className="mt-3 text-sm text-rose-600 bg-rose-50 dark:bg-rose-900/30 rounded-xl px-4 py-2">{err}</p>}

                <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-stone-200 dark:border-stone-600 text-stone-600 dark:text-stone-300 text-sm font-semibold hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors">Cancel</button>
                    <button onClick={handleSubmit} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                        {loading ? <><RefreshCw className="h-4 w-4 animate-spin" />Listing...</> : 'List Item'}
                    </button>
                </div>
            </div>
        </div>
    );
}

const EcoSwapDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [allListings, setAllListings] = useState([]);
    const [myListings, setMyListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [search, setSearch] = useState('');
    const [successfulSwapsCount, setSuccessfulSwapsCount] = useState(0);
    const [userEcoPoints, setUserEcoPoints] = useState(0);
    const [profilePic, setProfilePic] = useState(null);
    const [notifications, setNotifications] = useState([]);

    const token = sessionStorage.getItem('jwt_token');
    const jwt = parseJwt(token);
    const isAdmin = jwt?.role === 'ADMIN';
    const username = jwt?.sub || 'User';
    const userId = jwt?.userId || null;

    const fetchAll = useCallback(async () => {
        setIsLoading(true); setError(null);
        try {
            const res = await fetch(`${API}/products/all`, { headers: authHeaders() });
            if (!res.ok) throw new Error('Failed to fetch listings.');
            setAllListings(await res.json());
        } catch (e) { setError(e.message); }
        finally { setIsLoading(false); }
    }, []);

    const fetchMyListings = useCallback(async () => {
        if (!userId) return;
        try {
            const res = await fetch(`${API}/products/user/${userId}`, { headers: authHeaders() });
            if (!res.ok) throw new Error('Failed to fetch your listings.');
            setMyListings(await res.json());
        } catch (e) { setError(e.message); }
    }, [userId]);

    const fetchUserStats = useCallback(async () => {
        if (!userId || !username) return;
        try {
            const swapsRes = await fetch(`${API}/swaps/all`, { headers: authHeaders() });
            if (swapsRes.ok) {
                const allSwaps = await swapsRes.json();
                const mySuccessfulSwaps = allSwaps.filter(swap =>
                    swap.status === 'ACCEPTED' &&
                    (swap.requester?.username === username || swap.requestedProduct?.user?.username === username)
                );
                setSuccessfulSwapsCount(mySuccessfulSwaps.length);
                const userRes = await fetch(`${API}/auth/${userId}`, { headers: authHeaders() });
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUserEcoPoints(userData.ecoPoints || 0);
                    setProfilePic(userData.profilePictureURL);
                } else {
                    setUserEcoPoints(mySuccessfulSwaps.length * 100);
                }
            }
        } catch (e) { console.error('Failed to fetch user stats:', e); }
    }, [userId, username]);

    const fetchNotifications = useCallback(async () => {
        if (!username) return;
        try {
            const res = await fetch(`${API}/notifications/user/${username}`, { headers: authHeaders() });
            if (res.ok) {
                setNotifications(await res.json());
            }
        } catch (e) { console.error('Failed to fetch notifications:', e); }
    }, [username]);

    const markNotificationAsRead = async (id) => {
        try {
            const res = await fetch(`${API}/notifications/${id}/read`, { method: 'PUT', headers: authHeaders() });
            if (res.ok) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true, isRead: true } : n));
            }
        } catch (e) { console.error('Failed to mark notification as read:', e); }
    };

    useEffect(() => {
        fetchAll();
        fetchUserStats();
        fetchNotifications();
    }, [fetchAll, fetchUserStats, fetchNotifications]);

    useEffect(() => { if (activeTab === 'myListings') fetchMyListings(); }, [activeTab, fetchMyListings]);

    const handleLogout = () => { sessionStorage.removeItem('jwt_token'); window.location.href = '/login'; };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this listing?')) return;
        try {
            const res = await fetch(`${API}/products/${id}`, { method: 'DELETE', headers: authHeaders() });
            if (!res.ok) throw new Error('Delete failed.');
            fetchMyListings();
        } catch (e) { alert(e.message); }
    };

    const handleListSuccess = () => {
        setShowModal(false); fetchAll();
        if (activeTab === 'myListings') fetchMyListings();
    };

    const filteredListings = allListings.filter(
        item => item.productName?.toLowerCase().includes(search.toLowerCase()) ||
            item.productDescription?.toLowerCase().includes(search.toLowerCase())
    );

    const stats = [
        { title: 'Active Listings', value: allListings.length.toString(), icon: Tag, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/40' },
        { title: 'Successful Swaps', value: successfulSwapsCount.toString(), icon: RefreshCw, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/40' },
        { title: 'Est. CO₂ Saved (kg)', value: (successfulSwapsCount * 6.5).toFixed(1), icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-100 dark:bg-teal-900/40' },
        { title: 'Eco Points', value: userEcoPoints.toString(), icon: Award, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/40' },
    ];

    const navItems = [
        { key: 'dashboard',    label: 'Dashboard',     icon: LayoutDashboard },
        { key: 'myListings',   label: 'My Listings',   icon: Tag },
        { key: 'swapRequests', label: 'Swap Requests', icon: RefreshCw },
        { key: 'settings',     label: 'Settings',      icon: SettingsIcon },
        ...(isAdmin ? [{ key: 'admin', label: 'Admin', icon: Shield }] : []),
    ];

    const unreadNotifications = notifications.filter(n => !(n.read || n.isRead));

    return (
        <div className="flex h-screen bg-stone-50 dark:bg-stone-900 font-sans text-stone-800 dark:text-stone-100">
            <aside className="w-64 bg-white dark:bg-stone-800 border-r border-stone-200 dark:border-stone-700 flex flex-col">
                <div className="h-20 flex items-center px-6 border-b border-stone-100 dark:border-stone-700">
                    <div className="h-10 w-10 bg-emerald-500 rounded-xl flex items-center justify-center mr-3 shadow-sm">
                        <Leaf className="text-white h-6 w-6" />
                    </div>
                    <span className="text-2xl font-bold text-stone-900 dark:text-white tracking-tight">EcoSwap</span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-colors ${
                                activeTab === key
                                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                    : 'text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-700 hover:text-stone-900 dark:hover:text-white'
                            }`}
                        >
                            <Icon className="h-5 w-5 mr-3" />{label}
                        </button>
                    ))}
                </nav>

                <div className="px-4 py-4 border-t border-stone-100 dark:border-stone-700">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 text-stone-500 dark:text-stone-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 rounded-xl font-medium transition-colors"
                    >
                        <LogOut className="h-5 w-5 mr-3" />Log Out
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col overflow-hidden bg-stone-50 dark:bg-stone-900">
                <header className="h-20 bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between px-8">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                        <input
                            type="text"
                            placeholder="Search listings..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-stone-100 dark:bg-stone-700 dark:text-white dark:placeholder-stone-400 border-transparent rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowNotifications(!showNotifications);
                                    setShowProfileMenu(false);
                                }}
                                className="relative p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors text-stone-500 dark:text-stone-400"
                            >
                                <Bell className="h-5 w-5" />
                                {unreadNotifications.length > 0 && (
                                    <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-stone-800"></span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl shadow-lg z-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-700 flex justify-between items-center bg-stone-50 dark:bg-stone-800">
                                        <h3 className="font-bold text-sm text-stone-800 dark:text-white">Notifications</h3>
                                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                                            {unreadNotifications.length} New
                                        </span>
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-6 text-center text-sm text-stone-500 dark:text-stone-400">
                                                No notifications yet.
                                            </div>
                                        ) : (
                                            notifications.slice().reverse().map(notification => {
                                                const isRead = notification.read || notification.isRead;
                                                return (
                                                    <div
                                                        key={notification.id}
                                                        onClick={() => !isRead && markNotificationAsRead(notification.id)}
                                                        className={`p-4 border-b border-stone-100 dark:border-stone-700 transition-colors ${isRead ? 'bg-white dark:bg-stone-800 opacity-70' : 'bg-emerald-50/50 dark:bg-emerald-900/10 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}
                                                    >
                                                        <h4 className={`text-sm font-semibold mb-1 ${isRead ? 'text-stone-600 dark:text-stone-300' : 'text-stone-900 dark:text-white'}`}>
                                                            {notification.title}
                                                        </h4>
                                                        <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2">
                                                            {notification.message}
                                                        </p>
                                                    </div>
                                                )
                                            })
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowProfileMenu(!showProfileMenu);
                                    setShowNotifications(false);
                                }}
                                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
                            >
                                {profilePic ? (
                                    <img src={profilePic} alt="" className="h-9 w-9 rounded-full object-cover shadow-sm border border-stone-200 dark:border-stone-600" />
                                ) : (
                                    <div className="h-9 w-9 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                        {username.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span className="text-sm font-semibold text-stone-700 dark:text-stone-200">{username}</span>
                                <ChevronDown className="h-4 w-4 text-stone-400" />
                            </button>

                            {showProfileMenu && (
                                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl shadow-lg py-1 z-50">
                                    <div className="px-4 py-2 border-b border-stone-100 dark:border-stone-700">
                                        <p className="text-xs text-stone-400">Signed in as</p>
                                        <p className="text-sm font-semibold text-stone-800 dark:text-white truncate">{username}</p>
                                    </div>
                                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                                        <LogOut className="h-4 w-4" />Log Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-8">
                    {activeTab === 'dashboard' && (
                        <>
                            <div className="flex items-end justify-between mb-8">
                                <div>
                                    <h1 className="text-3xl font-bold text-stone-900 dark:text-white tracking-tight">
                                        Welcome back, {username}! 🌿
                                    </h1>
                                    <p className="text-stone-500 dark:text-stone-400 mt-2 text-sm">Here is your impact and the latest community listings.</p>
                                </div>
                                <button onClick={() => setShowModal(true)} className="flex items-center px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 hover:shadow-md transition-all">
                                    <Plus className="h-5 w-5 mr-2" />List an Item
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                                {stats.map((s, i) => <StatCard key={i} {...s} />)}
                            </div>

                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-stone-900 dark:text-white">Community Listings</h2>
                            </div>

                            {isLoading && <p className="text-stone-500 dark:text-stone-400">Loading listings...</p>}
                            {error && <div className="bg-rose-50 dark:bg-rose-900/30 p-4 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 mb-6">{error}</div>}
                            {!isLoading && !error && filteredListings.length === 0 && (
                                <p className="text-stone-500 dark:text-stone-400">No items found. Be the first to list something!</p>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-8">
                                {filteredListings.map(item => <ProductCard key={item.id} item={item} showDelete={false} />)}
                            </div>
                        </>
                    )}

                    {activeTab === 'myListings' && (
                        <>
                            <div className="flex items-end justify-between mb-8">
                                <div>
                                    <h1 className="text-3xl font-bold text-stone-900 dark:text-white tracking-tight">My Listings</h1>
                                    <p className="text-stone-500 dark:text-stone-400 mt-2 text-sm">Manage the items you've listed.</p>
                                </div>
                                <button onClick={() => setShowModal(true)} className="flex items-center px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 hover:shadow-md transition-all">
                                    <Plus className="h-5 w-5 mr-2" />List an Item
                                </button>
                            </div>

                            {myListings.length === 0 && <p className="text-stone-500 dark:text-stone-400">You haven't listed anything yet.</p>}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-8">
                                {myListings.map(item => <ProductCard key={item.id} item={item} showDelete onDelete={handleDelete} />)}
                            </div>
                        </>
                    )}

                    {activeTab === 'swapRequests' && <SwapRequests userId={userId} onSwapAction={fetchUserStats} />}
                    {activeTab === 'settings' && <Settings onBack={() => setActiveTab('dashboard')} />}
                    {activeTab === 'admin' && isAdmin && <AdminPanel />}
                </div>
            </main>

            {showModal && <ListItemModal onClose={() => setShowModal(false)} onSuccess={handleListSuccess} />}
            {(showProfileMenu || showNotifications) && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                        setShowProfileMenu(false);
                        setShowNotifications(false);
                    }}
                />
            )}
        </div>
    );
};

export default EcoSwapDashboard;