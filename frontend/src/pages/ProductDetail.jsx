import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Euro, User, Package, RefreshCw,
    Check, X, ChevronDown, Loader, ChevronLeft, ChevronRight,
    Trash2, ImagePlus
} from 'lucide-react';

const API = 'http://localhost:8080/api';

function parseJwt(token) {
    try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
}

function authHeaders() {
    const token = sessionStorage.getItem('jwt_token');
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

function authHeadersNoContentType() {
    const token = sessionStorage.getItem('jwt_token');
    return { Authorization: `Bearer ${token}` };
}

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const token = sessionStorage.getItem('jwt_token');
    const jwt = parseJwt(token);
    const currentUserId = jwt?.userId;

    const [product, setProduct] = useState(null);
    const [myProducts, setMyProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Carousel State
    const [imgIndex, setImgIndex] = useState(0);
    const images = product?.imageUrls || [];
    const hasImages = images.length > 0;

    // Swap Form State
    const [showSwapForm, setShowSwapForm] = useState(false);
    const [offeredProductId, setOfferedProductId] = useState('');
    const [message, setMessage] = useState('');
    const [swapLoading, setSwapLoading] = useState(false);
    const [swapStatus, setSwapStatus] = useState(null);
    const [swapErr, setSwapErr] = useState('');
    const [imageUploading, setImageUploading] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [prodRes, myProdsRes] = await Promise.all([
                    fetch(`${API}/products/${id}`, { headers: authHeaders() }),
                    currentUserId
                        ? fetch(`${API}/products/user/${currentUserId}`, { headers: authHeaders() })
                        : Promise.resolve(null),
                ]);
                if (!prodRes.ok) throw new Error('Product not found.');
                setProduct(await prodRes.json());
                if (myProdsRes?.ok) setMyProducts(await myProdsRes.json());
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, currentUserId]);

    const isOwner = product?.user?.id === currentUserId;

    // --- Image Handlers ---

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        setImageUploading(true);
        try {
            const formData = new FormData();
            files.forEach(file => formData.append('files', file));

            // Note the updated POST /images endpoint
            const res = await fetch(`${API}/products/${id}/images`, {
                method: 'POST',
                headers: authHeadersNoContentType(),
                body: formData,
            });
            if (!res.ok) throw new Error('Upload failed.');
            const updatedUrls = await res.json();
            setProduct(p => ({ ...p, imageUrls: updatedUrls }));
        } catch (e) {
            alert(e.message);
        } finally {
            setImageUploading(false);
        }
    };

    const handleDeleteImage = async () => {
        if (!window.confirm('Delete this photo?')) return;
        try {
            const res = await fetch(`${API}/products/${id}/images/${imgIndex}`, {
                method: 'DELETE',
                headers: authHeaders(),
            });
            if (!res.ok) throw new Error('Failed to delete photo.');
            const updatedUrls = await res.json();
            setProduct(p => ({ ...p, imageUrls: updatedUrls }));

            // Adjust index if we deleted the last image
            if (imgIndex >= updatedUrls.length && updatedUrls.length > 0) {
                setImgIndex(updatedUrls.length - 1);
            } else if (updatedUrls.length === 0) {
                setImgIndex(0);
            }
        } catch (e) {
            alert(e.message);
        }
    };

    const nextImg = () => setImgIndex((i) => (i + 1) % images.length);
    const prevImg = () => setImgIndex((i) => (i - 1 + images.length) % images.length);

    // --- Swap Handler ---

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
            <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
                <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors text-sm font-medium">
                    <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                </button>
                <div className="h-5 w-px bg-stone-200" />
                <span className="text-sm text-stone-400 truncate">{product?.productName}</span>
            </header>

            <div className="max-w-4xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Image Panel / Carousel */}
                    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="relative h-80 bg-stone-100 flex items-center justify-center group/carousel">
                            {hasImages ? (
                                <>
                                    <img
                                        src={images[imgIndex]}
                                        alt={`${product.productName} - view ${imgIndex + 1}`}
                                        className="w-full h-full object-contain bg-black/5"
                                    />

                                    {/* Navigation Arrows */}
                                    {images.length > 1 && (
                                        <>
                                            <button onClick={prevImg} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur rounded-full p-2 shadow-sm hover:bg-white hover:text-emerald-600 transition-all text-stone-600 z-10">
                                                <ChevronLeft className="h-5 w-5" />
                                            </button>
                                            <button onClick={nextImg} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur rounded-full p-2 shadow-sm hover:bg-white hover:text-emerald-600 transition-all text-stone-600 z-10">
                                                <ChevronRight className="h-5 w-5" />
                                            </button>

                                            {/* Pagination Dots */}
                                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                {images.map((_, idx) => (
                                                    <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === imgIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/60'}`} />
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    {/* Owner Delete Button */}
                                    {isOwner && (
                                        <button onClick={handleDeleteImage} className="absolute top-3 right-3 bg-white/90 backdrop-blur p-2 rounded-lg text-rose-500 shadow-sm hover:bg-rose-50 hover:text-rose-600 transition-colors z-20" title="Delete this photo">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </>
                            ) : (
                                <Package className="h-20 w-20 text-stone-300" />
                            )}
                        </div>

                        {/* Image Actions Footer */}
                        <div className="p-4 border-t border-stone-100 flex items-center justify-between bg-white">
                            <div className="flex items-center gap-2 text-stone-400 text-sm">
                                <User className="h-4 w-4" />
                                Listed by <strong className="text-stone-700 ml-1">{product?.user?.username || 'Unknown'}</strong>
                            </div>

                            {isOwner && (
                                <label className="cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-semibold hover:bg-emerald-100 transition-colors">
                                    {imageUploading ? <Loader className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                                    {imageUploading ? 'Uploading...' : 'Add Photos'}
                                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Details panel */}
                    <div className="flex flex-col gap-5">
                        <div>
                            <h1 className="text-3xl font-bold text-stone-900 tracking-tight mb-2">{product?.productName}</h1>
                            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-xl">
                                <Euro className="h-5 w-5" />{Number(product?.productPrice).toFixed(2)}
                            </span>
                        </div>

                        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
                            <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Description</h3>
                            <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-line">{product?.productDescription || 'No description provided.'}</p>
                        </div>

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
                                        <Check className="h-4 w-4 flex-shrink-0" /> Swap request sent!
                                    </div>
                                )}

                                {!showSwapForm ? (
                                    <button onClick={() => setShowSwapForm(true)} className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
                                        <RefreshCw className="h-4 w-4" /> Propose a Swap
                                    </button>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-stone-500 mb-1.5">Offer one of your items *</label>
                                            {myProducts.length === 0 ? (
                                                <p className="text-xs text-stone-400 bg-stone-50 rounded-xl px-4 py-3">
                                                    No listed items. <button onClick={() => navigate('/dashboard')} className="text-emerald-600 font-medium hover:underline">List one first.</button>
                                                </p>
                                            ) : (
                                                <div className="relative">
                                                    <select value={offeredProductId} onChange={e => setOfferedProductId(e.target.value)} className="w-full px-4 py-2.5 bg-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 appearance-none">
                                                        <option value="">Select an item...</option>
                                                        {myProducts.map(p => (
                                                            <option key={p.id} value={p.id}>{p.productName} — ${Number(p.productPrice).toFixed(2)}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-stone-500 mb-1.5">Message <span className="font-normal text-stone-400">(optional)</span></label>
                                            <textarea rows={3} value={message} onChange={e => setMessage(e.target.value)} placeholder="Tell the owner why you'd like to swap..." className="w-full px-4 py-2.5 bg-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
                                        </div>

                                        {swapStatus === 'error' && <p className="text-xs text-rose-600 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100">{swapErr}</p>}

                                        <div className="flex gap-3">
                                            <button onClick={() => { setShowSwapForm(false); setSwapStatus(null); }} className="flex-1 py-2.5 border border-stone-200 text-stone-600 rounded-xl text-sm font-semibold hover:bg-stone-50 transition-colors">Cancel</button>
                                            <button onClick={handleSwapSubmit} disabled={swapLoading || myProducts.length === 0} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm">
                                                {swapLoading ? <Loader className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                                                {swapLoading ? 'Sending...' : 'Send Request'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {isOwner && (
                            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4 text-sm text-emerald-800 text-center">
                                This is your listing. You can manage your photos using the controls on the image panel. Check the <strong>Swap Requests</strong> tab on your dashboard for offers!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}