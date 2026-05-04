import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ArrowRight, Check, X, Clock, Package, Loader } from 'lucide-react';

const API = 'http://localhost:8080/api';

function authHeaders() {
    const token = sessionStorage.getItem('jwt_token');
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

const STATUS_STYLES = {
    PENDING:  { bg: 'bg-amber-100 dark:bg-amber-900/40',  text: 'text-amber-700 dark:text-amber-400',  icon: Clock,  label: 'Pending' },
    ACCEPTED: { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-400', icon: Check, label: 'Accepted' },
    REJECTED: { bg: 'bg-rose-100 dark:bg-rose-900/40',   text: 'text-rose-700 dark:text-rose-400',   icon: X,     label: 'Rejected' },
};

function StatusBadge({ status }) {
    const s = STATUS_STYLES[status] || STATUS_STYLES.PENDING;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${s.bg} ${s.text}`}>
            <s.icon className="h-3 w-3" />
            {s.label}
        </span>
    );
}

function SwapCard({ swap, isIncoming, onStatusUpdate }) {
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (status) => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/swaps/${swap.id}/status?status=${status}`, {
                method: 'PUT',
                headers: authHeaders(),
            });
            if (!res.ok) throw new Error('Failed to update status.');
            onStatusUpdate();
        } catch (e) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm p-5 flex flex-col gap-4 transition-colors">
            {/* Products involved */}
            <div className="flex items-center gap-3">
                <div className="flex-1 bg-stone-50 dark:bg-stone-900/50 rounded-xl p-3 border border-stone-100 dark:border-stone-700/50 transition-colors">
                    <p className="text-xs text-stone-400 dark:text-stone-500 font-semibold mb-1 uppercase tracking-wide">
                        {isIncoming ? 'They Offer' : 'You Offer'}
                    </p>
                    <p className="text-sm font-bold text-stone-800 dark:text-stone-100 line-clamp-1">
                        {swap.offeredProduct?.productName || '—'}
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                        ${Number(swap.offeredProduct?.productPrice || 0).toFixed(2)}
                    </p>
                </div>

                <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center transition-colors">
                        <ArrowRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                </div>

                <div className="flex-1 bg-stone-50 dark:bg-stone-900/50 rounded-xl p-3 border border-stone-100 dark:border-stone-700/50 transition-colors">
                    <p className="text-xs text-stone-400 dark:text-stone-500 font-semibold mb-1 uppercase tracking-wide">
                        {isIncoming ? 'They Want' : 'You Want'}
                    </p>
                    <p className="text-sm font-bold text-stone-800 dark:text-stone-100 line-clamp-1">
                        {swap.requestedProduct?.productName || '—'}
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                        ${Number(swap.requestedProduct?.productPrice || 0).toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Meta */}
            <div className="flex items-center justify-between">
                <div className="text-xs text-stone-400 dark:text-stone-500">
                    {isIncoming
                        ? <>From <strong className="text-stone-600 dark:text-stone-300">{swap.requester?.username}</strong></>
                        : <>To <strong className="text-stone-600 dark:text-stone-300">{swap.requestedProduct?.user?.username}</strong></>
                    }
                </div>
                <StatusBadge status={swap.status} />
            </div>

            {/* Message */}
            {swap.message && (
                <div className="bg-stone-50 dark:bg-stone-900/50 rounded-xl px-4 py-3 border border-stone-100 dark:border-stone-700/50 transition-colors">
                    <p className="text-xs text-stone-400 dark:text-stone-500 font-semibold mb-1">Message</p>
                    <p className="text-sm text-stone-600 dark:text-stone-300 italic">"{swap.message}"</p>
                </div>
            )}

            {/* Actions — only for incoming pending */}
            {isIncoming && swap.status === 'PENDING' && (
                <div className="flex gap-3 pt-1">
                    <button
                        onClick={() => handleUpdate('REJECTED')}
                        disabled={loading}
                        className="flex-1 py-2 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-semibold hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        <X className="h-4 w-4" /> Reject
                    </button>
                    <button
                        onClick={() => handleUpdate('ACCEPTED')}
                        disabled={loading}
                        className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 dark:hover:bg-emerald-500 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        Accept
                    </button>
                </div>
            )}
        </div>
    );
}

export default function SwapRequests({ userId, onSwapAction }) {
    const [tab, setTab] = useState('incoming');
    const [incoming, setIncoming] = useState([]);
    const [outgoing, setOutgoing] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSwaps = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const [inRes, outRes] = await Promise.all([
                fetch(`${API}/swaps/incoming/${userId}`, { headers: authHeaders() }),
                fetch(`${API}/swaps/outgoing/${userId}`, { headers: authHeaders() }),
            ]);
            if (inRes.ok) setIncoming(await inRes.json());
            if (outRes.ok) setOutgoing(await outRes.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => { fetchSwaps(); }, [fetchSwaps]);

    const handleStatusUpdate = useCallback(() => {
        fetchSwaps();
        if (onSwapAction) {
            onSwapAction();
        }
    }, [fetchSwaps, onSwapAction]);

    const current = tab === 'incoming' ? incoming : outgoing;

    return (
        <div className="flex-1 overflow-auto p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-stone-900 dark:text-white tracking-tight">Swap Requests</h1>
                <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">Manage incoming and outgoing swap proposals.</p>
            </div>

            <div className="flex bg-stone-100 dark:bg-stone-800 rounded-xl p-1 w-fit mb-6 gap-1 transition-colors">
                {['incoming', 'outgoing'].map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors capitalize ${
                            tab === t
                                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-sm'
                                : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                        }`}
                    >
                        {t}
                        <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-md transition-colors ${
                            tab === t
                                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                                : 'bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-300'
                        }`}>
                            {t === 'incoming' ? incoming.length : outgoing.length}
                        </span>
                    </button>
                ))}
            </div>

            {loading && (
                <div className="flex items-center gap-2 text-stone-400 dark:text-stone-500 text-sm">
                    <Loader className="h-4 w-4 animate-spin" /> Loading...
                </div>
            )}

            {!loading && current.length === 0 && (
                <div className="text-center py-16">
                    <RefreshCw className="h-10 w-10 text-stone-200 dark:text-stone-700 mx-auto mb-3" />
                    <p className="text-stone-400 dark:text-stone-500 text-sm">No {tab} swap requests yet.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-8">
                {current.map(swap => (
                    <SwapCard
                        key={swap.id}
                        swap={swap}
                        isIncoming={tab === 'incoming'}
                        onStatusUpdate={handleStatusUpdate}
                    />
                ))}
            </div>
        </div>
    );
}