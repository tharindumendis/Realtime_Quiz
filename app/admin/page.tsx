"use client";
import { useState, useEffect } from "react";
import { 
  onAuthStateChanged, 
  User, 
  signInWithEmailAndPassword, 
  signOut,
  createUserWithEmailAndPassword, // 🚨 NEW: For user registration
} from "firebase/auth"; 
import { auth } from "@/util/firebaseConfig"; 

import AddQuiz from "@/components/AddQuiz";
import AdminActionPanel from "@/components/AdminActionPanael";
import AdminControl from "@/components/AdminControl";

const ADMIN_EMAIL = "admin@examly.com"; 

// =======================================================
// 🚨 NEW COMPONENT: User Registration Form
// =======================================================
const RegisterUserForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [registerStatus, setRegisterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setRegisterStatus('loading');
        setErrorMessage(null);

        if (password.length < 6) {
            setErrorMessage('Password must be at least 6 characters.');
            setRegisterStatus('error');
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            setRegisterStatus('success');
            setEmail('');
            setPassword('');
        } catch (error: any) {
            console.error("Registration error:", error);
            // Translate Firebase error codes to friendly messages
            if (error.code === 'auth/email-already-in-use') {
                setErrorMessage('The email address is already in use by another account.');
            } else if (error.code === 'auth/invalid-email') {
                setErrorMessage('The email address is not valid.');
            } else {
                setErrorMessage('Registration failed: ' + error.message);
            }
            setRegisterStatus('error');
        }
    };

    return (
        <div className="p-4 border rounded-lg ">
            <h3 className="text-lg font-bold mb-3 text-yellow-800">Register New User</h3>
            <form onSubmit={handleRegister} className="flex flex-col gap-3">
                <input
                    type="email"
                    placeholder="New User Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-2 rounded text-sm"
                    required
                    disabled={registerStatus === 'loading'}
                />
                <input
                    type="password"
                    placeholder="Password (min 6 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border p-2 rounded text-sm"
                    required
                    disabled={registerStatus === 'loading'}
                />
                <button
                    type="submit"
                    className={`px-4 py-2 rounded-lg  font-semibold transition-colors ${
                        registerStatus === 'loading' ? 'bg-gray-500' : 'bg-green-600 hover:bg-green-700'
                    }`}
                    disabled={registerStatus === 'loading' || !email || !password}
                >
                    {registerStatus === 'loading' ? 'Creating...' : 'Register User'}
                </button>
            </form>
            
            {registerStatus === 'success' && (
                <p className="text-green-600 mt-2 font-medium">User created successfully!</p>
            )}
            {errorMessage && (
                <p className="text-red-600 mt-2 text-sm">{errorMessage}</p>
            )}
        </div>
    );
};
// =======================================================
// END Register User Form
// =======================================================


export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsAdmin(currentUser.email === ADMIN_EMAIL);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (userCredential.user.email === ADMIN_EMAIL) {
        setIsAdmin(true);
      } else {
        alert("Login successful, but this account is not authorized for Admin access. Logging out.");
        await signOut(auth);
      }
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setLoginError('Invalid email or password.');
      } else {
        setLoginError('An unknown error occurred during login.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  const handleLogout = async () => {
    await signOut(auth);
    alert("Logged out successfully.");
  };


  // --- 1. Loading State ---
  if (loading) {
    return (
      <div className="p-8 text-xl">
        Loading authentication status...
      </div>
    );
  }
  
  // --- 2. Login Form (If not admin) ---
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen  p-8">
        <div className=" p-8 rounded-xl shadow-2xl w-full max-w-sm">
          {/* ... Login Form remains here ... */}
          <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">
            Admin Login 🔒
          </h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input 
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoggingIn}
              className="border p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <input 
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoggingIn}
              className="border p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            
            {loginError && (
              <p className="text-red-500 text-sm">{loginError}</p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn || !email || !password}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {isLoggingIn ? "Logging In..." : "Log In"}
            </button>
          </form>
          <p className="text-xs text-center text-gray-400 mt-4">
            Authorized access only.
          </p>
        </div>
      </div>
    );
  }

  // --- 3. Admin Granted Access ---
  return (
    <div className="flex flex-col items-center justify-center p-8 w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center w-full mb-6 pb-4 border-b">
        <h1 className="text-2xl font-bold text-blue-800">
          Admin Dashboard
        </h1>
        <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">Logged in as: {user?.email}</p>
            <button
                onClick={handleLogout}
                className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
            >
                Log Out
            </button>
        </div>
      </div>
      
      {/* 🚨 NEW REGISTRATION FORM INTEGRATION */}
      <div className="w-full mb-6">
          <RegisterUserForm />
      </div>
      
      <div className="w-full border-b pb-4 mb-4">
          <AdminControl/>
      </div>
      <div className="w-full border-b pb-4 mb-4">
          <AddQuiz/>
      </div>
      <div className="w-full">
          <AdminActionPanel/>
      </div>
    </div>
  );
}