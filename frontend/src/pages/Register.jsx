import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, UserPlus, Image as ImageIcon } from 'lucide-react';
import api from '../api/axiosConfig';

export default function Register() {
    const [formData, setFormData] = useState({
        username: '', firstName: '', lastName: '',
        email: '', password: '', confirmPassword: '',
        phoneNumber: '', profilePictureUrl: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError(''); // Clear error when typing
    };

    const handleImageChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const uploadImageToCloudinary = async () => {
        if (!imageFile) return "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg";

        const cloudData = new FormData();
        cloudData.append("file", imageFile);
        cloudData.append("upload_preset", "default-profile-picture");
        cloudData.append("cloud_name", "dt7lmh37n");

        try {
            const response = await fetch("https://api.cloudinary.com/v1_1/dt7lmh37n/image/upload", {
                method: "POST",
                body: cloudData
            });
            const imgData = await response.json();
            return imgData.url.toString();
        } catch (error) {
            console.error("Error uploading image:", error);
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        setIsUploading(true);

        const imageUrl = await uploadImageToCloudinary();

        if (!imageUrl) {
            setError("Image upload failed! Please try again.");
            setIsUploading(false);
            return;
        }

        const finalDataToSubmit = {
            ...formData,
            profilePictureUrl: imageUrl
        };

        try {
            await api.post('/auth/register', finalDataToSubmit);
            navigate('/login');
        } catch (error) {
            setError("Registration failed. Username or email might already be taken.");
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 font-sans p-4 py-10">
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-xl border border-stone-200">

                {/* Brand Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="h-14 w-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-sm mb-4 transform -rotate-6">
                        <Leaf className="text-white h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Create Account</h2>
                    <p className="text-stone-500 text-sm mt-1">Join the EcoSwap community</p>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                    {/* File Upload Area */}
                    <div className="flex flex-col mb-2">
                        <label className="block text-xs font-semibold text-stone-500 mb-2">Profile Picture <span className="font-normal text-stone-400">(Optional)</span></label>
                        <div className="flex items-center gap-3">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="w-full text-sm text-stone-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-stone-500 mb-1.5">First Name *</label>
                            <input name="firstName" onChange={handleChange} placeholder="Jane" required className="w-full px-4 py-3 bg-stone-100 rounded-xl text-sm text-stone-800 outline-none focus:ring-2 focus:ring-emerald-500 border border-transparent transition-all placeholder-stone-400" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-stone-500 mb-1.5">Last Name *</label>
                            <input name="lastName" onChange={handleChange} placeholder="Doe" required className="w-full px-4 py-3 bg-stone-100 rounded-xl text-sm text-stone-800 outline-none focus:ring-2 focus:ring-emerald-500 border border-transparent transition-all placeholder-stone-400" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-stone-500 mb-1.5">Username *</label>
                            <input name="username" onChange={handleChange} placeholder="eco_warrior" required className="w-full px-4 py-3 bg-stone-100 rounded-xl text-sm text-stone-800 outline-none focus:ring-2 focus:ring-emerald-500 border border-transparent transition-all placeholder-stone-400" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-stone-500 mb-1.5">Phone Number *</label>
                            <input name="phoneNumber" onChange={handleChange} placeholder="+1 234 567 8900" required className="w-full px-4 py-3 bg-stone-100 rounded-xl text-sm text-stone-800 outline-none focus:ring-2 focus:ring-emerald-500 border border-transparent transition-all placeholder-stone-400" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-stone-500 mb-1.5">Email Address *</label>
                        <input name="email" type="email" onChange={handleChange} placeholder="jane@example.com" required className="w-full px-4 py-3 bg-stone-100 rounded-xl text-sm text-stone-800 outline-none focus:ring-2 focus:ring-emerald-500 border border-transparent transition-all placeholder-stone-400" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-stone-500 mb-1.5">Password *</label>
                            <input name="password" type="password" onChange={handleChange} placeholder="••••••••" required className="w-full px-4 py-3 bg-stone-100 rounded-xl text-sm text-stone-800 outline-none focus:ring-2 focus:ring-emerald-500 border border-transparent transition-all placeholder-stone-400" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-stone-500 mb-1.5">Confirm Password *</label>
                            <input name="confirmPassword" type="password" onChange={handleChange} placeholder="••••••••" required className="w-full px-4 py-3 bg-stone-100 rounded-xl text-sm text-stone-800 outline-none focus:ring-2 focus:ring-emerald-500 border border-transparent transition-all placeholder-stone-400" />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mt-2 bg-rose-50 border border-rose-100 text-rose-600 text-sm px-4 py-2.5 rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isUploading}
                        className="mt-4 w-full bg-emerald-600 text-white font-semibold rounded-xl py-3 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isUploading ? 'Setting up account...' : (
                            <>
                                Create Account <UserPlus className="h-4 w-4" />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer Link */}
                <p className="mt-8 text-center text-stone-500 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors hover:underline">
                        Log in here
                    </Link>
                </p>
            </div>
        </div>
    );
}