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
import { auth, googleProvider } from "./config";

const AuthContext = createContext();

export function useAuth() {
	return useContext(AuthContext);
}

export function AuthProvider({ children }) {
	const [currentUser, setCurrentUser] = useState(null);
	const [loading, setLoading] = useState(true);

	// Sign up with email and password
	function signup(email, password, displayName) {
		return createUserWithEmailAndPassword(auth, email, password).then((result) => {
			if (displayName) {
				return updateProfile(result.user, { displayName });
			}
			return result;
		});
	}

	// Sign in with email and password
	function login(email, password) {
		return signInWithEmailAndPassword(auth, email, password);
	}

	// Sign in with Google
	function signInWithGoogle() {
		return signInWithPopup(auth, googleProvider);
	}

	// Sign out
	function logout() {
		return signOut(auth);
	}

	// Reset password
	function resetPassword(email) {
		return sendPasswordResetEmail(auth, email);
	}

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
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
