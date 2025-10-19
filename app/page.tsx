
"use client";
import Link from "next/link";
import { useAuth } from "@/util/AuthContext"; // 🚨 Use the custom hook
import { signOut } from "firebase/auth";
import { auth } from "@/util/firebaseConfig";
import AuthForm from "@/components/AuthForm";

export default function Home() {
  // 🚨 SIMPLIFIED: Get state from context
  const { user, loading } = useAuth();
  
  // The rest of the component logic relies on 'user' and 'loading'

  const userName = user?.email; 

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
        try {
            await signOut(auth);
            alert("Logged out successfully.");
        } catch (error) {
            console.error("Logout Error:", error);
            alert("Logout failed. Please try again.");
        }
    }
  };
  
  const handleLoginSuccess = () => { /* ... */ };

  // ------------------------------------
  // Render Loading/Login Form
  // ------------------------------------
  if (loading) {
    return <div className="p-8 text-xl">Loading authentication...</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
        {/* ... Login Form ... */}
        <AuthForm onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // ------------------------------------
  // Render Main Navigation
  // ------------------------------------
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-2">Quiz App</h1>
      
      <div className="flex items-center text-lg text-gray-600 mb-8">
        <p>Logged in as: <span className="font-semibold text-blue-600">{userName}</span></p>
        
        <button
          onClick={handleLogout}
          className="ml-4 text-sm text-red-500 hover:text-red-700 underline transition-colors"
        >
          (Log Out)
        </button>
      </div>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link href={"/study"} className="text-center bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition">
          Generate Notes
        </Link>
        <Link href={"/submit"} className="text-center bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
          Submit Answer
        </Link>
        <Link href={"/leaderboard"} className="text-center bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition">
          Leaderboard
        </Link>
        <Link href={"/admin"} className="text-center bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition">
          Admin (Requires Admin Login)
        </Link>
      </div>
    </div>
  );
}