import React, { useState, useEffect, useCallback } from 'react';
import {
    Leaf, LayoutDashboard, Tag, RefreshCw, TrendingUp, Award,
    LogOut, Plus, MapPin, Search, X, ChevronDown,
    PackageOpen, Trash2, DollarSign
} from 'lucide-react';
import { Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Settings from './Settings';
import SwapRequests from './SwapRequests';

// ── helpers ──────────────────────────────────────────────────────────────────

function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return null;
    }
}

const API = 'http://localhost:8080/api';

function authHeaders() {
    const token = sessionStorage.getItem('jwt_token');
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };
}

// ── components ────────────────────────────────────────────────────────────────

function StatCard({ title, value, icon: Icon, color, bg }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center space-x-4">
            <div className={`p-4 rounded-xl ${bg}`}>
                <Icon className={`h-6 w-6 ${color}`} />
            </div>
            <div>
                <p className="text-sm font-semibold text-stone-500">{title}</p>
                <p className="text-2xl font-bold text-stone-900 mt-0.5">{value}</p>
            </div>
        </div>
    );
}

function ProductCard({ item, onDelete, showDelete }) {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/products/${item.id}`)}
            className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-lg transition-all group cursor-pointer flex flex-col relative"
        >
            <div className="relative h-40 bg-stone-100 flex items-center justify-center overflow-hidden">
                <PackageOpen className="h-12 w-12 text-stone-300" />
                {showDelete && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                        className="absolute top-2 right-2 bg-white rounded-lg p-1.5 shadow hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                )}
            </div>
            <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-stone-900 text-base mb-1 line-clamp-1">{item.productName}</h3>
                <p className="text-stone-500 text-xs line-clamp-2 mb-3">{item.productDescription}</p>
                <div className="mt-auto flex items-center justify-between">
                    <span className="text-emerald-700 font-bold text-sm flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5" />{Number(item.productPrice).toFixed(2)}
                    </span>
                    {item.user && (
                        <span className="text-xs text-stone-400 flex items-center gap-1">
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
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    const handleSubmit = async () => {
        if (!form.productName || !form.productPrice) {
            setErr('Name and price are required.');
            return;
        }
        setLoading(true);
        setErr(null);
        try {
            const res = await fetch(`${API}/products`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ ...form, productPrice: parseFloat(form.productPrice) }),
            });
            if (!res.ok) throw new Error(await res.text());
            onSuccess();
        } catch (e) {
            setErr(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-stone-900">List an Item</h2>
                    <button onClick={onClose} className="text-stone-400 hover:text-stone-700 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-stone-500 mb-1.5">Product Name *</label>
                        <input
                            className="w-full px-4 py-2.5 bg-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="e.g. Vintage Denim Jacket"
                            value={form.productName}
                            onChange={e => setForm(f => ({ ...f, productName: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-stone-500 mb-1.5">Description</label>
                        <textarea
                            rows={3}
                            className="w-full px-4 py-2.5 bg-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                            placeholder="Describe the item, condition, etc."
                            value={form.productDescription}
                            onChange={e => setForm(f => ({ ...f, productDescription: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-stone-500 mb-1.5">Price (USD) *</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-2.5 bg-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="0.00"
                            value={form.productPrice}
                            onChange={e => setForm(f => ({ ...f, productPrice: e.target.value }))}
                        />
                    </div>
                </div>

                {err && <p className="mt-3 text-sm text-rose-600 bg-rose-50 rounded-xl px-4 py-2">{err}</p>}

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm font-semibold hover:bg-stone-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60"
                    >
                        {loading ? 'Listing...' : 'List Item'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── main dashboard ────────────────────────────────────────────────────────────

const EcoSwapDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [allListings, setAllListings] = useState([]);
    const [myListings, setMyListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [search, setSearch] = useState('');

    const token = sessionStorage.getItem('jwt_token');
    const jwt = parseJwt(token);
    const username = jwt?.sub || 'User';
    const userId = jwt?.userId || null;

    // ── data fetching ─────────────────────────────────────────────────────────

    const fetchAll = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API}/products/all`, { headers: authHeaders() });
            if (!res.ok) throw new Error('Failed to fetch listings.');
            setAllListings(await res.json());
        } catch (e) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchMyListings = useCallback(async () => {
        if (!userId) return;
        try {
            const res = await fetch(`${API}/products/user/${userId}`, { headers: authHeaders() });
            if (!res.ok) throw new Error('Failed to fetch your listings.');
            setMyListings(await res.json());
        } catch (e) {
            setError(e.message);
        }
    }, [userId]);

    useEffect(() => { fetchAll(); }, [fetchAll]);
    useEffect(() => { if (activeTab === 'myListings') fetchMyListings(); }, [activeTab, fetchMyListings]);

    // ── actions ───────────────────────────────────────────────────────────────

    const handleLogout = () => {
        sessionStorage.removeItem('jwt_token');
        window.location.href = '/login';
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this listing?')) return;
        try {
            const res = await fetch(`${API}/products/${id}`, { method: 'DELETE', headers: authHeaders() });
            if (!res.ok) throw new Error('Delete failed.');
            fetchMyListings();
        } catch (e) {
            alert(e.message);
        }
    };

    const handleListSuccess = () => {
        setShowModal(false);
        fetchAll();
        if (activeTab === 'myListings') fetchMyListings();
    };

    // ── derived ───────────────────────────────────────────────────────────────

    const filteredListings = allListings.filter(
        item => item.productName?.toLowerCase().includes(search.toLowerCase()) ||
            item.productDescription?.toLowerCase().includes(search.toLowerCase())
    );

    const stats = [
        { title: 'Active Listings', value: allListings.length.toString(), icon: Tag, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        { title: 'Successful Swaps', value: '48', icon: RefreshCw, color: 'text-blue-600', bg: 'bg-blue-100' },
        { title: 'Est. CO₂ Saved (kg)', value: '312', icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-100' },
        { title: 'Eco Points', value: '850', icon: Award, color: 'text-amber-500', bg: 'bg-amber-100' },
    ];

    const navItems = [
        { key: 'dashboard',     label: 'Dashboard',      icon: LayoutDashboard },
        { key: 'myListings',    label: 'My Listings',    icon: Tag },
        { key: 'swapRequests',  label: 'Swap Requests',  icon: RefreshCw },
        { key: 'settings',      label: 'Settings',       icon: SettingsIcon },
    ];

    // ── render ────────────────────────────────────────────────────────────────

    return (
        <div className="flex h-screen bg-stone-50 font-sans text-stone-800">

            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-stone-200 flex flex-col">
                <div className="h-20 flex items-center px-6 border-b border-stone-100">
                    <div className="h-10 w-10 bg-emerald-500 rounded-xl flex items-center justify-center mr-3 shadow-sm">
                        <Leaf className="text-white h-6 w-6" />
                    </div>
                    <span className="text-2xl font-bold text-stone-900 tracking-tight">EcoSwap</span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-colors ${
                                activeTab === key
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
                            }`}
                        >
                            <Icon className="h-5 w-5 mr-3" />
                            {label}
                        </button>
                    ))}
                </nav>

                <div className="px-4 py-4 border-t border-stone-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 text-stone-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl font-medium transition-colors"
                    >
                        <LogOut className="h-5 w-5 mr-3" />
                        Log Out
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 flex flex-col overflow-hidden">

                {/* Header */}
                <header className="h-20 bg-white border-b border-stone-200 flex items-center justify-between px-8">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                        <input
                            type="text"
                            placeholder="Search listings..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-stone-100 border-transparent rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                        />
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowProfileMenu(v => !v)}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-stone-100 transition-colors"
                        >
                            <div className="h-9 w-9 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                {username.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold text-stone-700">{username}</span>
                            <ChevronDown className="h-4 w-4 text-stone-400" />
                        </button>

                        {showProfileMenu && (
                            <div className="absolute right-0 mt-2 w-44 bg-white border border-stone-200 rounded-xl shadow-lg py-1 z-50">
                                <div className="px-4 py-2 border-b border-stone-100">
                                    <p className="text-xs text-stone-400">Signed in as</p>
                                    <p className="text-sm font-semibold text-stone-800 truncate">{username}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Log Out
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-auto p-8">

                    {/* ── Dashboard Tab ── */}
                    {activeTab === 'dashboard' && (
                        <>
                            <div className="flex items-end justify-between mb-8">
                                <div>
                                    <h1 className="text-3xl font-bold text-stone-900 tracking-tight">
                                        Welcome back, {username}! 🌿
                                    </h1>
                                    <p className="text-stone-500 mt-2 text-sm">Here is your impact and the latest community listings.</p>
                                </div>
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="flex items-center px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 hover:shadow-md transition-all"
                                >
                                    <Plus className="h-5 w-5 mr-2" />
                                    List an Item
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                                {stats.map((s, i) => <StatCard key={i} {...s} />)}
                            </div>

                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-stone-900">Community Listings</h2>
                            </div>

                            {isLoading && <p className="text-stone-500">Loading listings...</p>}
                            {error && (
                                <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 text-rose-700 mb-6">
                                    {error}
                                </div>
                            )}
                            {!isLoading && !error && filteredListings.length === 0 && (
                                <p className="text-stone-500">No items found. Be the first to list something!</p>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-8">
                                {filteredListings.map(item => (
                                    <ProductCard key={item.id} item={item} showDelete={false} />
                                ))}
                            </div>
                        </>
                    )}

                    {/* ── My Listings Tab ── */}
                    {activeTab === 'myListings' && (
                        <>
                            <div className="flex items-end justify-between mb-8">
                                <div>
                                    <h1 className="text-3xl font-bold text-stone-900 tracking-tight">My Listings</h1>
                                    <p className="text-stone-500 mt-2 text-sm">Manage the items you've listed.</p>
                                </div>
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="flex items-center px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 hover:shadow-md transition-all"
                                >
                                    <Plus className="h-5 w-5 mr-2" />
                                    List an Item
                                </button>
                            </div>

                            {myListings.length === 0 && (
                                <p className="text-stone-500">You haven't listed anything yet.</p>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-8">
                                {myListings.map(item => (
                                    <ProductCard key={item.id} item={item} showDelete onDelete={handleDelete} />
                                ))}
                            </div>
                        </>
                    )}

                    {/* ── Swap Requests Tab ── */}
                    {activeTab === 'swapRequests' && (
                        <SwapRequests userId={userId} />
                    )}

                    {/* ── Settings Tab ── */}
                    {activeTab === 'settings' && (
                        <Settings onBack={() => setActiveTab('dashboard')} />
                    )}
                </div>
            </main>

            {showModal && (
                <ListItemModal onClose={() => setShowModal(false)} onSuccess={handleListSuccess} />
            )}

            {showProfileMenu && (
                <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
            )}
        </div>
    );
};

export default EcoSwapDashboard;
