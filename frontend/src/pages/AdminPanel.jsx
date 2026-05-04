import React, { useState, useEffect, useCallback } from 'react';
import {
    Users, Package, RefreshCw, Shield, Ban, CheckCircle,
    Trash2, Search, ChevronDown, ChevronUp, Loader,
    AlertTriangle, Clock, X, Check
} from 'lucide-react';

const API = 'http://localhost:8080/api';

function authHeaders() {
    const token = sessionStorage.getItem('jwt_token');
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

const STATUS_STYLES = {
    PENDING:  { bg: 'bg-amber-100 dark:bg-amber-900/40',   text: 'text-amber-700 dark:text-amber-400',   icon: Clock,  label: 'Pending'  },
    ACCEPTED: { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-400', icon: Check,  label: 'Accepted' },
    REJECTED: { bg: 'bg-rose-100 dark:bg-rose-900/40',    text: 'text-rose-700 dark:text-rose-400',    icon: X,      label: 'Rejected' },
};

function StatusBadge({ status }) {
    const s = STATUS_STYLES[status] || STATUS_STYLES.PENDING;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold ${s.bg} ${s.text} transition-colors`}>
            <s.icon className="h-3 w-3" />{s.label}
        </span>
    );
}

// ── Users Tab ─────────────────────────────────────────────────────────────────

function UsersTab() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/admin/users`, { headers: authHeaders() });
            if (!res.ok) throw new Error('Failed to fetch users.');
            setUsers(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleBan = async (userId, isBanned) => {
        setActionLoading(userId);
        try {
            const endpoint = isBanned ? 'unban' : 'ban';
            const res = await fetch(`${API}/admin/users/${userId}/${endpoint}`, {
                method: 'PUT',
                headers: authHeaders(),
            });
            if (!res.ok) throw new Error(await res.text());
            fetchUsers();
        } catch (e) {
            alert(e.message);
        } finally {
            setActionLoading(null);
        }
    };

    const filtered = users.filter(u =>
        u.username?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="relative mb-5 w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-stone-500" />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search users..."
                    className="w-full pl-9 pr-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 transition-colors"
                />
            </div>

            {loading ? (
                <div className="flex items-center gap-2 text-stone-400 dark:text-stone-500 text-sm"><Loader className="h-4 w-4 animate-spin" /> Loading...</div>
            ) : (
                <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-hidden shadow-sm transition-colors">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="border-b border-stone-100 dark:border-stone-700/50 bg-stone-50 dark:bg-stone-900/50 transition-colors">
                            <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">User</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">Email</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">Role</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">Status</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filtered.map(user => (
                            <tr key={user.id} className="border-b border-stone-50 dark:border-stone-700/50 hover:bg-stone-50 dark:hover:bg-stone-700/30 transition-colors">
                                <td className="px-5 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                            {user.username?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-stone-800 dark:text-stone-100">{user.username}</p>
                                            <p className="text-xs text-stone-400 dark:text-stone-500">{user.firstName} {user.lastName}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-3 text-stone-500 dark:text-stone-400">{user.email}</td>
                                <td className="px-5 py-3">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold transition-colors ${
                                            user.role === 'ADMIN'
                                                ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400'
                                                : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                                        }`}>
                                            {user.role === 'ADMIN' && <Shield className="h-3 w-3" />}
                                            {user.role}
                                        </span>
                                </td>
                                <td className="px-5 py-3">
                                    {user.banned ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 transition-colors">
                                                <Ban className="h-3 w-3" /> Banned
                                            </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 transition-colors">
                                                <CheckCircle className="h-3 w-3" /> Active
                                            </span>
                                    )}
                                </td>
                                <td className="px-5 py-3">
                                    {user.role !== 'ADMIN' && (
                                        <button
                                            onClick={() => handleBan(user.id, user.banned)}
                                            disabled={actionLoading === user.id}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60 ${
                                                user.banned
                                                    ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/60'
                                                    : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-900/60'
                                            }`}
                                        >
                                            {actionLoading === user.id
                                                ? <Loader className="h-3 w-3 animate-spin" />
                                                : user.banned
                                                    ? <><CheckCircle className="h-3 w-3" /> Unban</>
                                                    : <><Ban className="h-3 w-3" /> Ban</>
                                            }
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {filtered.length === 0 && (
                        <p className="text-center text-stone-400 dark:text-stone-500 text-sm py-8">No users found.</p>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Products Tab ──────────────────────────────────────────────────────────────

function ProductsTab() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deletingId, setDeletingId] = useState(null);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/products/all`, { headers: authHeaders() });
            if (!res.ok) throw new Error();
            setProducts(await res.json());
        } catch {
            console.error('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const handleDelete = async (productId) => {
        if (!window.confirm('Permanently delete this product?')) return;
        setDeletingId(productId);
        try {
            const res = await fetch(`${API}/admin/products/${productId}`, {
                method: 'DELETE',
                headers: authHeaders(),
            });
            if (!res.ok) throw new Error('Delete failed.');
            fetchProducts();
        } catch (e) {
            alert(e.message);
        } finally {
            setDeletingId(null);
        }
    };

    const filtered = products.filter(p =>
        p.productName?.toLowerCase().includes(search.toLowerCase()) ||
        p.user?.username?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="relative mb-5 w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-stone-500" />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search products or users..."
                    className="w-full pl-9 pr-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 transition-colors"
                />
            </div>

            {loading ? (
                <div className="flex items-center gap-2 text-stone-400 dark:text-stone-500 text-sm"><Loader className="h-4 w-4 animate-spin" /> Loading...</div>
            ) : (
                <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-hidden shadow-sm transition-colors">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="border-b border-stone-100 dark:border-stone-700/50 bg-stone-50 dark:bg-stone-900/50 transition-colors">
                            <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">Product</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">Listed By</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">Price</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">Status</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filtered.map(product => (
                            <tr key={product.id} className="border-b border-stone-50 dark:border-stone-700/50 hover:bg-stone-50 dark:hover:bg-stone-700/30 transition-colors">
                                <td className="px-5 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-700 flex items-center justify-center overflow-hidden flex-shrink-0 transition-colors">
                                            {product.imageUrls?.[0]
                                                ? <img src={product.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                                                : <Package className="h-5 w-5 text-stone-300 dark:text-stone-500" />
                                            }
                                        </div>
                                        <div>
                                            <p className="font-semibold text-stone-800 dark:text-stone-100 line-clamp-1">{product.productName}</p>
                                            <p className="text-xs text-stone-400 dark:text-stone-500 line-clamp-1">{product.productDescription}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-3 text-stone-600 dark:text-stone-300 font-medium">{product.user?.username || '—'}</td>
                                <td className="px-5 py-3 text-emerald-700 dark:text-emerald-400 font-semibold">${Number(product.productPrice).toFixed(2)}</td>
                                <td className="px-5 py-3">
                                    {product.available === false ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 transition-colors">
                                                Unavailable
                                            </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 transition-colors">
                                                Available
                                            </span>
                                    )}
                                </td>
                                <td className="px-5 py-3">
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        disabled={deletingId === product.id}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-900/60 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60"
                                    >
                                        {deletingId === product.id
                                            ? <Loader className="h-3 w-3 animate-spin" />
                                            : <Trash2 className="h-3 w-3" />
                                        }
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <p className="text-center text-stone-400 dark:text-stone-500 text-sm py-8">No products found.</p>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Swaps Tab ─────────────────────────────────────────────────────────────────

function SwapsTab() {
    const [swaps, setSwaps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        const fetchSwaps = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API}/admin/swaps`, { headers: authHeaders() });
                if (!res.ok) throw new Error();
                setSwaps(await res.json());
            } catch {
                console.error('Failed to fetch swaps');
            } finally {
                setLoading(false);
            }
        };
        fetchSwaps();
    }, []);

    const filtered = filter === 'ALL' ? swaps : swaps.filter(s => s.status === filter);
    const counts = {
        ALL: swaps.length,
        PENDING: swaps.filter(s => s.status === 'PENDING').length,
        ACCEPTED: swaps.filter(s => s.status === 'ACCEPTED').length,
        REJECTED: swaps.filter(s => s.status === 'REJECTED').length,
    };

    return (
        <div>
            {/* Filter pills */}
            <div className="flex gap-2 mb-5 flex-wrap">
                {['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                            filter === f ? 'bg-emerald-600 dark:bg-emerald-500 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                        }`}
                    >
                        {f} <span className="ml-1 opacity-70">({counts[f]})</span>
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center gap-2 text-stone-400 dark:text-stone-500 text-sm"><Loader className="h-4 w-4 animate-spin" /> Loading...</div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(swap => (
                        <div key={swap.id} className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm overflow-hidden transition-colors">
                            <button
                                onClick={() => setExpanded(expanded === swap.id ? null : swap.id)}
                                className="w-full flex items-center justify-between px-5 py-4 hover:bg-stone-50 dark:hover:bg-stone-700/30 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <StatusBadge status={swap.status} />
                                    <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                                        {swap.requester?.username} wants {swap.requestedProduct?.productName}
                                    </span>
                                    <span className="text-xs text-stone-400 dark:text-stone-500">
                                        offering {swap.offeredProduct?.productName}
                                    </span>
                                </div>
                                {expanded === swap.id
                                    ? <ChevronUp className="h-4 w-4 text-stone-400 dark:text-stone-500" />
                                    : <ChevronDown className="h-4 w-4 text-stone-400 dark:text-stone-500" />
                                }
                            </button>

                            {expanded === swap.id && (
                                <div className="px-5 pb-4 border-t border-stone-100 dark:border-stone-700/50 pt-4 grid grid-cols-2 gap-4 text-sm transition-colors">
                                    <div className="bg-stone-50 dark:bg-stone-900/50 rounded-xl p-3 transition-colors">
                                        <p className="text-xs text-stone-400 dark:text-stone-500 font-semibold mb-1">REQUESTER</p>
                                        <p className="font-semibold text-stone-800 dark:text-stone-100">{swap.requester?.username}</p>
                                    </div>
                                    <div className="bg-stone-50 dark:bg-stone-900/50 rounded-xl p-3 transition-colors">
                                        <p className="text-xs text-stone-400 dark:text-stone-500 font-semibold mb-1">PRODUCT OWNER</p>
                                        <p className="font-semibold text-stone-800 dark:text-stone-100">{swap.requestedProduct?.user?.username}</p>
                                    </div>
                                    <div className="bg-stone-50 dark:bg-stone-900/50 rounded-xl p-3 transition-colors">
                                        <p className="text-xs text-stone-400 dark:text-stone-500 font-semibold mb-1">OFFERED</p>
                                        <p className="font-semibold text-stone-800 dark:text-stone-100">{swap.offeredProduct?.productName}</p>
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400">${Number(swap.offeredProduct?.productPrice || 0).toFixed(2)}</p>
                                    </div>
                                    <div className="bg-stone-50 dark:bg-stone-900/50 rounded-xl p-3 transition-colors">
                                        <p className="text-xs text-stone-400 dark:text-stone-500 font-semibold mb-1">REQUESTED</p>
                                        <p className="font-semibold text-stone-800 dark:text-stone-100">{swap.requestedProduct?.productName}</p>
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400">${Number(swap.requestedProduct?.productPrice || 0).toFixed(2)}</p>
                                    </div>
                                    {swap.message && (
                                        <div className="col-span-2 bg-stone-50 dark:bg-stone-900/50 rounded-xl p-3 transition-colors">
                                            <p className="text-xs text-stone-400 dark:text-stone-500 font-semibold mb-1">MESSAGE</p>
                                            <p className="text-stone-600 dark:text-stone-300 italic">"{swap.message}"</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <p className="text-center text-stone-400 dark:text-stone-500 text-sm py-8">No swaps found.</p>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Main Admin Panel ──────────────────────────────────────────────────────────

export default function AdminPanel() {
    const [tab, setTab] = useState('users');

    const tabs = [
        { key: 'users',    label: 'Users',    icon: Users },
        { key: 'products', label: 'Products', icon: Package },
        { key: 'swaps',    label: 'Swaps',    icon: RefreshCw },
    ];

    return (
        <div className="flex-1 overflow-auto p-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center transition-colors">
                    <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-stone-900 dark:text-white tracking-tight transition-colors">Admin Panel</h1>
                    <p className="text-stone-500 dark:text-stone-400 text-sm mt-0.5 transition-colors">Manage users, products, and swap activity.</p>
                </div>
                <div className="ml-3 flex items-center gap-1.5 px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-xl text-xs font-semibold transition-colors">
                    <AlertTriangle className="h-3.5 w-3.5" /> Admin only
                </div>
            </div>

            {/* Tab bar */}
            <div className="flex bg-stone-100 dark:bg-stone-800 rounded-xl p-1 w-fit mb-6 gap-1 transition-colors">
                {tabs.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                            tab === key
                                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-sm'
                                : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                        }`}
                    >
                        <Icon className="h-4 w-4" />{label}
                    </button>
                ))}
            </div>

            {tab === 'users'    && <UsersTab />}
            {tab === 'products' && <ProductsTab />}
            {tab === 'swaps'    && <SwapsTab />}
        </div>
    );
}