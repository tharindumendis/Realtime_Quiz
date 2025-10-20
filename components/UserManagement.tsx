"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/util/AuthContext";
import { database } from "@/util/firebaseConfig"; // Use for additional RTDB management if needed
import { ref, remove } from "firebase/database";

interface AppUser {
    uid: string;
    email: string;
    creationTime: string;
    lastSignInTime: string;
    disabled: boolean;
}

const UserManagement = () => {
    const { user: adminUser } = useAuth();
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            // NOTE: We don't need to send auth token here for this simple example, 
            // but in a production app, the server should verify the admin user's token.
            const response = await fetch('/api/admin/users', { 
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch users: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Filter out the current admin user from the list for safety/cleanliness
            const filteredUsers = data.users.filter((u: AppUser) => u.uid !== adminUser?.uid);
            setUsers(filteredUsers);

        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [adminUser]);

    const handleDeleteUser = async (uid: string, email: string) => {
        if (!window.confirm(`Are you sure you want to delete user ${email}? This action is permanent and will delete their account and all quiz answers.`)) {
            return;
        }

        try {
            // Call the server-side DELETE API route
            const response = await fetch('/api/admin/users', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Deletion failed with status: ${response.status}`);
            }

            alert(`User ${email} deleted successfully.`);
            fetchUsers(); // Refresh the list

        } catch (err: any) {
            console.error(err);
            setError(`Deletion Error: ${err.message}`);
        }
    };

    if (loading) return <p className="text-center py-4">Loading users...</p>;
    if (error) return <p className="text-center py-4 text-red-500">Error: {error}</p>;

    return (
        <div className="w-full p-6 border rounded-lg bg-white">
            <h3 className="text-xl font-bold mb-4">Manage Registered Users ({users.length})</h3>
            
            <button 
                onClick={fetchUsers}
                className="mb-4 text-sm bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
            >
                Refresh List
            </button>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email (ID)</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.uid}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {user.email}
                                    <span className="block text-xs text-gray-500 truncate" title={user.uid}>{user.uid}</span>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(user.creationTime).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => handleDeleteUser(user.uid, user.email)}
                                        className="text-red-600 hover:text-red-900 text-sm p-1 rounded border border-red-300"
                                        disabled={user.disabled}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;