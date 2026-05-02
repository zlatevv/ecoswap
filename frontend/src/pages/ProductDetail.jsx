import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, DollarSign, User, Package, RefreshCw,
    MessageSquare, Check, X, ChevronDown, Loader
} from 'lucide-react';

const API = 'http://localhost:8080/api';

function parseJwt(token) {
    try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
}

function authHeaders() {
    const token = sessionStorage.getItem('jwt_token');
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const token = sessionStorage.getItem('jwt_token');
    const jwt = parseJwt(token);
    const currentUserId = jwt?.userId;
    const currentUsername = jwt?.sub;

    const [product, setProduct] = useState(null);
    const [myProducts, setMyProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Swap form state
    const [showSwapForm, setShowSwapForm] = useState(false);
    const [offeredProductId, setOfferedProductId] = useState('');
    const [message, setMessage] = useState('');
    const [swapLoading, setSwapLoading] = useState(false);
    const [swapStatus, setSwapStatus] = useState(null); // 'success' | 'error'
    const [swapErr, setSwapErr] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [productRes, myProductsRes] = await Promise.all([
                    fetch(`${API}/products/${id}`, { headers: authHeaders() }),
                    currentUserId
                        ? fetch(`${API}/products/user/${currentUserId}`, { headers: authHeaders() })
                        : Promise.resolve(null),
                ]);

                if (!productRes.ok) throw new Error('Product not found.');
                setProduct(await productRes.json());

                if (myProductsRes?.ok) {
                    setMyProducts(await myProductsRes.json());
                }
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, currentUserId]);

    const isOwner = product?.user?.id === currentUserId;

    const handleSwapSubmit = async () => {
        if (!offeredProductId) { setSwapErr('Select one of your items to offer.'); setSwapStatus('error'); return; }

        setSwapLoading(true);
        setSwapStatus(null);
        try {
            const res = await fetch(`${API}/swaps`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({
                    requestedProductId: parseInt(id),
                    offeredProductId: parseInt(offeredProductId),
                    message,
                }),
            });
            if (!res.ok) throw new Error(await res.text());
            setSwapStatus('success');
            setShowSwapForm(false);
            setOfferedProductId('');
            setMessage('');
        } catch (e) {
            setSwapErr(e.message);
            setSwapStatus('error');
        } finally {
            setSwapLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center">
            <Loader className="h-8 w-8 text-emerald-500 animate-spin" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center">
            <div className="text-center">
                <p className="text-rose-600 font-semibold mb-4">{error}</p>
                <button onClick={() => navigate(-1)} className="text-emerald-600 font-medium hover:underline">Go back</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-stone-50 font-sans">
            {/* Top bar */}
            <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors text-sm font-medium"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </button>
                <div className="h-5 w-px bg-stone-200" />
                <span className="text-sm text-stone-400 truncate">{product?.productName}</span>
            </header>

            <div className="max-w-4xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Left — image placeholder */}
                    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                        <div className="h-72 bg-gradient-to-br from-emerald-50 to-stone-100 flex items-center justify-center">
                            <Package className="h-20 w-20 text-stone-300" />
                        </div>
                        <div className="p-5 border-t border-stone-100">
                            <div className="flex items-center gap-2 text-stone-400 text-sm">
                                <User className="h-4 w-4" />
                                <span>Listed by <strong className="text-stone-700">{product?.user?.username || 'Unknown'}</strong></span>
                            </div>
                        </div>
                    </div>

                    {/* Right — details */}
                    <div className="flex flex-col gap-5">
                        <div>
                            <h1 className="text-3xl font-bold text-stone-900 tracking-tight mb-2">{product?.productName}</h1>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-xl">
                                    <DollarSign className="h-5 w-5" />
                                    {Number(product?.productPrice).toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
                            <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Description</h3>
                            <p className="text-stone-700 text-sm leading-relaxed">
                                {product?.productDescription || 'No description provided.'}
                            </p>
                        </div>

                        {/* Swap section */}
                        {!isOwner && (
                            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                        <RefreshCw className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <h3 className="font-bold text-stone-900">Request a Swap</h3>
                                </div>

                                {swapStatus === 'success' && (
                                    <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-4 py-3 rounded-xl mb-4">
                                        <Check className="h-4 w-4 flex-shrink-0" />
                                        Swap request sent successfully!
                                    </div>
                                )}

                                {!showSwapForm ? (
                                    <button
                                        onClick={() => setShowSwapForm(true)}
                                        className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        Propose a Swap
                                    </button>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Offer one of my items */}
                                        <div>
                                            <label className="block text-xs font-semibold text-stone-500 mb-1.5">
                                                Offer one of your items *
                                            </label>
                                            {myProducts.length === 0 ? (
                                                <p className="text-xs text-stone-400 bg-stone-50 rounded-xl px-4 py-3">
                                                    You have no listed items to offer.{' '}
                                                    <button onClick={() => navigate('/dashboard')} className="text-emerald-600 underline">List one first.</button>
                                                </p>
                                            ) : (
                                                <div className="relative">
                                                    <select
                                                        value={offeredProductId}
                                                        onChange={e => setOfferedProductId(e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                                                    >
                                                        <option value="">Select an item...</option>
                                                        {myProducts.map(p => (
                                                            <option key={p.id} value={p.id}>
                                                                {p.productName} — ${Number(p.productPrice).toFixed(2)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Message */}
                                        <div>
                                            <label className="block text-xs font-semibold text-stone-500 mb-1.5">
                                                Message <span className="font-normal text-stone-400">(optional)</span>
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={message}
                                                onChange={e => setMessage(e.target.value)}
                                                placeholder="Tell the owner why you'd like to swap..."
                                                className="w-full px-4 py-2.5 bg-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                            />
                                        </div>

                                        {swapStatus === 'error' && (
                                            <p className="text-xs text-rose-600 bg-rose-50 px-4 py-2 rounded-xl">{swapErr}</p>
                                        )}

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => { setShowSwapForm(false); setSwapStatus(null); }}
                                                className="flex-1 py-2.5 border border-stone-200 text-stone-600 rounded-xl text-sm font-semibold hover:bg-stone-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSwapSubmit}
                                                disabled={swapLoading || myProducts.length === 0}
                                                className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                                            >
                                                {swapLoading ? <Loader className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                                                {swapLoading ? 'Sending...' : 'Send Request'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {isOwner && (
                            <div className="bg-stone-100 rounded-2xl px-5 py-4 text-sm text-stone-500 text-center">
                                This is your listing. Manage swap requests in the <strong>Swap Requests</strong> tab.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
