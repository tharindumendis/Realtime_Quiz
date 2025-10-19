"use client";
import { useState } from "react";
import { auth } from "@/util/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

// A component for general user login (registered by admin)
const AuthForm = ({ onLoginSuccess }: { onLoginSuccess: () => void }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoggingIn(true);
        
        try {
            await signInWithEmailAndPassword(auth, email, password);
            onLoginSuccess(); // Notify parent component (app/page.tsx)
        } catch (error: any) {
            console.error("Login error:", error.message);
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                setError('Invalid email or password.');
            } else {
                setError('Login failed. Please check your credentials.');
            }
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm">
            <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">
                User Login
            </h1>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <input 
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoggingIn}
                    className="border p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                />
                <input 
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoggingIn}
                    className="border p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                />
                
                {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={isLoggingIn || !email || !password}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
                >
                    {isLoggingIn ? "Logging In..." : "Log In"}
                </button>
            </form>
            <p className="text-xs text-center text-gray-500 mt-4">
                Use the email/password credentials provided by the admin.
            </p>
        </div>
    );
};

export default AuthForm;