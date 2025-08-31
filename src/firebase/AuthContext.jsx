import React, { createContext, useContext, useState, useEffect } from "react";
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	sendPasswordResetEmail,
	signOut,
	onAuthStateChanged,
	signInWithPopup,
	updateProfile,
	EmailAuthProvider,
	linkWithCredential,
	deleteUser,
	reauthenticateWithCredential,
	updatePassword,
} from "firebase/auth";
import {
	doc,
	setDoc,
	serverTimestamp,
	collection,
	getDocs,
	writeBatch,
	query,
	where,
	arrayRemove,
} from "firebase/firestore";
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

	// Update display name
	async function updateDisplayName(newDisplayName) {
		try {
			await updateProfile(auth.currentUser, { displayName: newDisplayName });

			// Update in Firestore
			const userRef = doc(db, "users", auth.currentUser.uid);
			await setDoc(
				userRef,
				{
					displayName: newDisplayName,
					updatedAt: serverTimestamp(),
				},
				{ merge: true }
			);

			return { success: true };
		} catch (error) {
			console.error("Error updating display name:", error);
			return { success: false, error: error.message };
		}
	}

	// Create password for Google account
	async function createPassword(password) {
		try {
			const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
			await linkWithCredential(auth.currentUser, credential);

			// Update user data to indicate password was created
			const userRef = doc(db, "users", auth.currentUser.uid);
			await setDoc(
				userRef,
				{
					hasPassword: true,
					updatedAt: serverTimestamp(),
				},
				{ merge: true }
			);

			return { success: true };
		} catch (error) {
			console.error("Error creating password:", error);
			return { success: false, error: error.message };
		}
	}

	// Delete all user data
	async function deleteAllUserData(password = null) {
		try {
			if (!auth.currentUser) {
				throw new Error("No user logged in");
			}

			// Re-authenticate user before deletion
			try {
				if (isGoogleUser()) {
					// For Google users, re-authenticate with Google popup
					await signInWithPopup(auth, googleProvider);
					// User is already re-authenticated through the popup
				} else {
					// For email/password users, require password
					if (!password) {
						return {
							success: false,
							error: "Password required for account deletion",
							requiresPassword: true,
						};
					}
					const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
					await reauthenticateWithCredential(auth.currentUser, credential);
				}
			} catch (authError) {
				console.error("Re-authentication failed:", authError);
				let errorMessage = "Authentication failed. Please try again.";

				if (authError.code === "auth/wrong-password") {
					errorMessage = "Incorrect password. Please try again.";
				} else if (authError.code === "auth/popup-closed-by-user") {
					errorMessage = "Authentication cancelled. Please try again.";
				}

				return { success: false, error: errorMessage };
			}

			const userId = auth.currentUser.uid;
			const batch = writeBatch(db);

			// COMPREHENSIVE DATA CLEANUP - Remove ALL traces of this user from the system:
			// 1. User's own profiles
			// 2. User's shared profiles
			// 3. User's outgoing shares
			// 4. User's incoming shares
			// 5. Collaborative profiles (owned or collaborated)
			// 6. References to this user in OTHER users' shares
			// 7. Legacy shared profiles owned by this user
			// 8. UserShares document structure
			// 9. Main user document
			// 10. Firebase Auth account

			// Delete user profiles
			const profilesRef = collection(db, "users", userId, "profiles");
			const profilesSnapshot = await getDocs(profilesRef);
			profilesSnapshot.docs.forEach((doc) => {
				batch.delete(doc.ref);
			});

			// Delete user shared profiles
			const sharedProfilesRef = collection(db, "users", userId, "sharedProfiles");
			const sharedProfilesSnapshot = await getDocs(sharedProfilesRef);
			sharedProfilesSnapshot.docs.forEach((doc) => {
				batch.delete(doc.ref);
			});

			// Delete outgoing shares
			const outgoingSharesRef = collection(db, "userShares", userId, "outgoing");
			const outgoingSharesSnapshot = await getDocs(outgoingSharesRef);
			outgoingSharesSnapshot.docs.forEach((doc) => {
				batch.delete(doc.ref);
			});

			// Delete incoming shares
			const incomingSharesRef = collection(db, "userShares", userId, "incoming");
			const incomingSharesSnapshot = await getDocs(incomingSharesRef);
			incomingSharesSnapshot.docs.forEach((doc) => {
				batch.delete(doc.ref);
			});

			// Clean up collaborative profiles
			await _cleanupCollaborativeProfiles(batch, userId);

			// Clean up all user references in other users' shares
			await _cleanupUserReferencesInShares(batch, userId);

			// Clean up legacy shared profiles
			await _cleanupLegacySharedProfiles(batch, userId);

			// Delete userShares document structure for this user
			try {
				const userSharesDocRef = doc(db, "userShares", userId);
				batch.delete(userSharesDocRef);
			} catch (error) {
				console.error("Error deleting userShares document:", error);
			}

			// Delete user document
			batch.delete(doc(db, "users", userId));

			// Commit batch
			await batch.commit();

			// Clear local storage
			localStorage.clear();
			sessionStorage.clear();

			// Delete user account
			await deleteUser(auth.currentUser);

			return { success: true };
		} catch (error) {
			console.error("Error deleting user data:", error);
			let errorMessage = "Failed to delete account data";

			if (error.code === "auth/requires-recent-login") {
				errorMessage = "Please log out and log back in before deleting your account";
			}

			return { success: false, error: errorMessage };
		}
	}

	// Helper: Clean up collaborative profiles on account deletion
	async function _cleanupCollaborativeProfiles(batch, userId) {
		try {
			const collaborativeProfilesRef = collection(db, "collaborativeProfiles");

			// Get all collaborative profiles
			const allCollaborativeProfiles = await getDocs(collaborativeProfilesRef);

			allCollaborativeProfiles.docs.forEach((docSnap) => {
				const profileData = docSnap.data();
				const profileId = docSnap.id;

				// Check if user is the owner
				if (profileData.permissions && profileData.permissions[userId] === "owner") {
					// User is owner - delete the entire collaborative profile
					batch.delete(doc(collaborativeProfilesRef, profileId));
				} else if (profileData.collaborators && profileData.collaborators.includes(userId)) {
					// User is a collaborator - remove them from the collaborative profile
					batch.update(doc(collaborativeProfilesRef, profileId), {
						collaborators: arrayRemove(userId),
						[`permissions.${userId}`]: null,
						lastModified: serverTimestamp(),
					});
				}
			});
		} catch (error) {
			console.error("Error cleaning up collaborative profiles:", error);
			// Don't throw error - allow deletion to continue
		}
	}

	// Helper: Clean up all user references in other users' shares
	async function _cleanupUserReferencesInShares(batch, userId) {
		try {
			// Get all users to check their shares
			const usersRef = collection(db, "users");
			const allUsers = await getDocs(usersRef);

			// Process each user's shares
			for (const userDoc of allUsers.docs) {
				const otherUserId = userDoc.id;

				// Skip the user being deleted
				if (otherUserId === userId) continue;

				// Clean up outgoing shares where this user was the target
				const outgoingSharesRef = collection(db, "userShares", otherUserId, "outgoing");
				const outgoingQuery = query(outgoingSharesRef, where("targetUserId", "==", userId));
				const outgoingSnapshot = await getDocs(outgoingQuery);

				outgoingSnapshot.docs.forEach((doc) => {
					batch.delete(doc.ref);
				});

				// Clean up incoming shares where this user was the owner
				const incomingSharesRef = collection(db, "userShares", otherUserId, "incoming");
				const incomingQuery = query(incomingSharesRef, where("ownerUserId", "==", userId));
				const incomingSnapshot = await getDocs(incomingQuery);

				incomingSnapshot.docs.forEach((doc) => {
					batch.delete(doc.ref);
				});
			}
		} catch (error) {
			console.error("Error cleaning up user references in shares:", error);
			// Don't throw error - allow deletion to continue
		}
	}

	// Helper: Clean up legacy shared profiles
	async function _cleanupLegacySharedProfiles(batch, userId) {
		try {
			// Clean up legacy shared profiles where this user is the original owner
			const sharedProfilesRef = collection(db, "sharedProfiles");
			const sharedQuery = query(sharedProfilesRef, where("originalUserId", "==", userId));
			const sharedSnapshot = await getDocs(sharedQuery);

			sharedSnapshot.docs.forEach((doc) => {
				batch.delete(doc.ref);
			});
		} catch (error) {
			console.error("Error cleaning up legacy shared profiles:", error);
			// Don't throw error - allow deletion to continue
		}
	}

	// Check if user has Google provider
	function isGoogleUser() {
		return auth.currentUser?.providerData.some((provider) => provider.providerId === "google.com");
	}

	// Check if user has password
	function hasPassword() {
		return auth.currentUser?.providerData.some((provider) => provider.providerId === "password");
	}

	// Change password
	async function changePassword(currentPassword, newPassword) {
		try {
			// Re-authenticate user first
			const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
			await reauthenticateWithCredential(auth.currentUser, credential);

			// Update password
			await updatePassword(auth.currentUser, newPassword);

			// Update user data to indicate password was updated
			const userRef = doc(db, "users", auth.currentUser.uid);
			await setDoc(
				userRef,
				{
					passwordUpdatedAt: serverTimestamp(),
					updatedAt: serverTimestamp(),
				},
				{ merge: true }
			);

			return { success: true };
		} catch (error) {
			console.error("Error changing password:", error);
			let errorMessage = "Failed to change password";

			if (error.code === "auth/wrong-password") {
				errorMessage = "Current password is incorrect";
			} else if (error.code === "auth/weak-password") {
				errorMessage = "New password is too weak";
			} else if (error.code === "auth/requires-recent-login") {
				errorMessage = "Please log out and log back in before changing your password";
			}

			return { success: false, error: errorMessage };
		}
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
		updateDisplayName,
		createPassword,
		changePassword,
		deleteAllUserData,
		isGoogleUser,
		hasPassword,
	};

	return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
