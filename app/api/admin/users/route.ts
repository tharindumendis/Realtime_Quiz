// app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// --- Firebase Admin Initialization ---

/**
 * Initializes the Firebase Admin SDK once globally.
 * * IMPORTANT: In a production environment, you MUST set the GOOGLE_APPLICATION_CREDENTIALS 
 * environment variable to point to your service account key file path, OR configure 
 * the private key variables directly in your environment.
 */
function initializeAdmin() {
    if (admin.apps.length === 0) {
        try {
            // Check if environment variables for service account are available
            if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PROJECT_ID) {
                admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId: process.env.FIREBASE_PROJECT_ID,
                        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                        // Replace escaped newline characters if key is passed as a string env var
                        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                    }),
                    // Use your RTDB URL from your environment configuration
                    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
                });
            } else {
                // Default Initialization: Relies on GOOGLE_APPLICATION_CREDENTIALS environment variable
                admin.initializeApp({
                    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
                });
            }
            console.log("Firebase Admin SDK initialized successfully.");
        } catch (error) {
            console.error("Firebase Admin initialization error. Check service account credentials:", error);
            // Throwing an error here prevents the API routes from working without proper setup
            throw new Error("Failed to initialize Firebase Admin SDK.");
        }
    }
}

// Initialize on load
initializeAdmin();

// --- API Handlers ---

// NOTE: We are skipping explicit token verification here for simplicity, 
// but in production, you must verify the admin's session token here.

// GET handler to list users
export async function GET(request: Request) {
    try {
        // Use the initialized admin SDK instance
        const listUsersResult = await admin.auth().listUsers(1000); 
        
        const users = listUsersResult.users.map(user => ({
            uid: user.uid,
            email: user.email,
            creationTime: user.metadata.creationTime,
            lastSignInTime: user.metadata.lastSignInTime,
            disabled: user.disabled,
        }));
        
        return NextResponse.json({ users }, { status: 200 });

    } catch (error) {
        console.error("Error listing users:", error);
        return NextResponse.json({ error: "Failed to fetch user list. Check Admin SDK credentials." }, { status: 500 });
    }
}

// DELETE handler to remove a user
export async function DELETE(request: Request) {
    try {
        const { uid } = await request.json();

        if (!uid) {
            return NextResponse.json({ error: "UID is required for deletion." }, { status: 400 });
        }
        
        // 1. Delete the user from Firebase Authentication
        await admin.auth().deleteUser(uid);
        
        // 2. Clean up the user's answers from Realtime Database using the Admin SDK
        await admin.database().ref(`UserAnswers/${uid}`).remove();

        return NextResponse.json({ message: `User ${uid} and associated answers deleted successfully.` }, { status: 200 });

    } catch (error: any) {
        // If the user doesn't exist, Firebase will throw an error, which we catch here.
        if (error.code === 'auth/user-not-found') {
             return NextResponse.json({ error: "User not found." }, { status: 404 });
        }
        console.error("Error deleting user:", error.stack);
        return NextResponse.json({ error: error.message || "Failed to delete user." }, { status: 500 });
    }
}