import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Login() {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', formData);
            console.log(response.data);
            sessionStorage.setItem('jwt_token', response.data.token);
            navigate('/dashboard');
        } catch (error) {
            console.log(error.response?.data);
            alert("Login Failed. Check your Spring Boot console.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950">
            <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-800">
                <h2 className="text-3xl font-bold text-center text-white mb-8">Welcome Back</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <input
                        name="username" onChange={handleChange} placeholder="Username" required
                        className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
                    />
                    <input
                        name="password" type="password" onChange={handleChange} placeholder="Password" required
                        className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
                    />

                    <button type="submit" className="mt-2 w-full bg-blue-600 text-white font-semibold rounded-lg py-3 hover:bg-blue-700 transition">
                        Sign In
                    </button>
                </form>

                <p className="mt-6 text-center text-gray-400 text-sm">
                    No account? <Link to="/register" className="text-blue-500 hover:text-blue-400">Register here</Link>
                </p>
            </div>
        </div>
    );
}