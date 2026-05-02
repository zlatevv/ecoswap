import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Register() {
    const [formData, setFormData] = useState({
        username: '', firstName: '', lastName: '',
        email: '', password: '', confirmPassword: '',
        phoneNumber: '', profilePictureUrl: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleImageChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const uploadImageToCloudinary = async () => {
        if (!imageFile) return "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"; // Default image if they don't upload one

        const cloudData = new FormData();
        cloudData.append("file", imageFile);
        cloudData.append("upload_preset", "default-profile-picture");
        cloudData.append("cloud_name", "dt7lmh37n");

        try {
            // Send to Cloudinary
            const response = await fetch("https://api.cloudinary.com/v1_1/\n" +
                "dt7lmh37n/image/upload", {
                method: "POST",
                body: cloudData
            });
            const imgData = await response.json();
            return imgData.url.toString(); // This is the link Cloudinary gives us back!
        } catch (error) {
            console.error("Error uploading image:", error);
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        setIsUploading(true);

        // 1. Upload image first
        const imageUrl = await uploadImageToCloudinary();

        if (!imageUrl) {
            alert("Image upload failed!");
            setIsUploading(false);
            return;
        }

        // 2. Add the new URL to our form data
        const finalDataToSubmit = {
            ...formData,
            profilePictureUrl: imageUrl
        };

        // 3. Send everything to Spring Boot
        try {
            await api.post('/auth/register', finalDataToSubmit);
            alert("Success! Now log in.");
            navigate('/login');
        } catch (error) {
            alert("Registration failed.");
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 py-10">
            {/* ... keeping the rest of your UI the same, just adding the file input ... */}
            <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-800">
                <h2 className="text-3xl font-bold text-center text-white mb-8">Create Account</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                    {/* Add Image Upload Input Here */}
                    <div className="flex flex-col">
                        <label className="text-gray-400 text-sm mb-1">Profile Picture (Optional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <input name="firstName" onChange={handleChange} placeholder="First Name" required className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500" />
                        <input name="lastName" onChange={handleChange} placeholder="Last Name" required className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500" />
                    </div>

                    <input name="username" onChange={handleChange} placeholder="Username" required className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500" />
                    <input name="email" type="email" onChange={handleChange} placeholder="Email" required className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500" />
                    <input name="phoneNumber" onChange={handleChange} placeholder="Phone Number" required className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500" />

                    <div className="grid grid-cols-2 gap-4">
                        <input name="password" type="password" onChange={handleChange} placeholder="Password" required className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500" />
                        <input name="confirmPassword" type="password" onChange={handleChange} placeholder="Confirm Password" required className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500" />
                    </div>

                    <button type="submit" disabled={isUploading} className="mt-4 w-full bg-blue-600 text-white font-semibold rounded-lg py-3 hover:bg-blue-700 transition disabled:bg-gray-500">
                        {isUploading ? "Uploading & Registering..." : "Register"}
                    </button>
                </form>

                <p className="mt-6 text-center text-gray-400 text-sm">
                    Have an account? <Link to="/login" className="text-blue-500 hover:text-blue-400">Log in</Link>
                </p>
            </div>
        </div>
    );
}