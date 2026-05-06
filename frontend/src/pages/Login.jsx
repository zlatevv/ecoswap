import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, LogIn } from 'lucide-react';
import api from '../api/axiosConfig';

export default function Login() {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const response = await api.post('/auth/login', formData);
            console.log('Response:', response);
            console.log('Data:', response.data);
            console.log('Token:', response.data.token);
            sessionStorage.setItem('jwt_token', response.data.token);
            navigate('/dashboard');
        } catch (error) {
            const message = error.response?.data?.message
                || error.response?.data
                || 'Login failed. Please try again.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 font-sans p-4">
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-md border border-stone-200">

                {/* Brand Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="h-14 w-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-sm mb-4 transform -rotate-6">
                        <Leaf className="text-white h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Welcome Back</h2>
                    <p className="text-stone-500 text-sm mt-1">Sign in to continue to EcoSwap</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-stone-500 mb-1.5">Username</label>
                        <input
                            name="username"
                            onChange={handleChange}
                            placeholder="e.g. eco_warrior"
                            required
                            className="w-full px-4 py-3 bg-stone-100 rounded-xl text-sm text-stone-800 outline-none focus:ring-2 focus:ring-emerald-500 border border-transparent transition-all placeholder-stone-400"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-stone-500 mb-1.5">Password</label>
                        <input
                            name="password"
                            type="password"
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                            className="w-full px-4 py-3 bg-stone-100 rounded-xl text-sm text-stone-800 outline-none focus:ring-2 focus:ring-emerald-500 border border-transparent transition-all placeholder-stone-400"
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-rose-50 border border-rose-100 text-rose-600 text-sm px-4 py-2.5 rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="mt-2 w-full bg-emerald-600 text-white font-semibold rounded-xl py-3 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
                    >
                        {isLoading ? 'Signing in...' : (
                            <>
                                Sign In <LogIn className="h-4 w-4" />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer Link */}
                <p className="mt-8 text-center text-stone-500 text-sm">
                    Don't have an account yet?{' '}
                    <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors hover:underline">
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
}