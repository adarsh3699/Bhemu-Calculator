import React, { createContext, useContext, useState, useEffect } from "react";
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	sendPasswordResetEmail,
	signOut,
	onAuthStateChanged,
	signInWithPopup,
	updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "./config";

const AuthContext = createContext();

export function useAuth() {
	return useContext(AuthContext);
}

export function AuthProvider({ children }) {
	const [currentUser, setCurrentUser] = useState(null);
	const [loading, setLoading] = useState(true);

	// Save user data to Firestore for email lookup
	async function saveUserData(user) {
		try {
			const userRef = doc(db, "users", user.uid);
			await setDoc(
				userRef,
				{
					email: user.email,
					displayName: user.displayName || user.email?.split("@")[0] || "User",
					photoURL: user.photoURL || null,
					createdAt: serverTimestamp(),
					lastLoginAt: serverTimestamp(),
				},
				{ merge: true }
			);
		} catch (error) {
			console.error("Error saving user data:", error);
		}
	}

	// Sign up with email and password
	function signup(email, password, displayName) {
		return createUserWithEmailAndPassword(auth, email, password).then(async (result) => {
			if (displayName) {
				await updateProfile(result.user, { displayName });
			}

			// Save user data for email lookup
			await saveUserData(result.user);

			return result;
		});
	}

	// Sign in with email and password
	function login(email, password) {
		return signInWithEmailAndPassword(auth, email, password).then(async (result) => {
			// Update last login time
			await saveUserData(result.user);
			return result;
		});
	}

	// Sign in with Google
	function signInWithGoogle() {
		return signInWithPopup(auth, googleProvider).then(async (result) => {
			// Save user data for email lookup
			await saveUserData(result.user);
			return result;
		});
	}

	// Sign out
	function logout() {
		// Clear all local storage data
		localStorage.removeItem("gpaProfiles");
		localStorage.removeItem("activeGpaProfile");

		// Clear all localStorage data for extra safety
		localStorage.clear();

		// Clear sessionStorage as well (if any data exists)
		sessionStorage.clear();

		return signOut(auth);
	}

	// Reset password
	function resetPassword(email) {
		return sendPasswordResetEmail(auth, email);
	}

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (user) {
				// Update user data on auth state change
				await saveUserData(user);
			}
			setCurrentUser(user);
			setLoading(false);
		});

		return unsubscribe;
	}, []);

	const value = {
		currentUser,
		signup,
		login,
		logout,
		resetPassword,
		signInWithGoogle,
	};

	return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
