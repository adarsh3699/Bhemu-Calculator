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
	reauthenticateWithPopup,
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

	// Delete all user data with comprehensive cleanup
	async function deleteAllUserData(password = null, useGoogleAuth = false) {
		try {
			if (!auth.currentUser) {
				throw new Error("No user logged in");
			}

			const originalUserId = auth.currentUser.uid;
			const originalUserEmail = auth.currentUser.email;

			// Secure re-authentication
			await _performSecureReAuthentication(originalUserId, originalUserEmail, password, useGoogleAuth);

			// Comprehensive data deletion
			console.log(`Starting data deletion for: ${originalUserEmail}`);
			await _executeComprehensiveDataDeletion(originalUserId, originalUserEmail);

			// Finalize account deletion
			localStorage.clear();
			sessionStorage.clear();
			await deleteUser(auth.currentUser);

			console.log("Account deletion completed successfully");
			return { success: true };
		} catch (error) {
			console.error("Account deletion error:", error);
			return _handleDeletionError(error);
		}
	}

	// Secure re-authentication with account verification
	async function _performSecureReAuthentication(originalUserId, originalUserEmail, password, useGoogleAuth = false) {
		const hasPass = hasPassword();
		const hasGoogle = isGoogleUser();

		if (useGoogleAuth && hasGoogle) {
			// User explicitly chose Google authentication
			await _performGoogleReAuth(originalUserId, originalUserEmail);
		} else if (hasPass && !useGoogleAuth) {
			// Use password authentication (default for accounts with password)
			if (!password) {
				throw { code: "auth/requires-password", message: "Password required for account deletion" };
			}
			const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
			await reauthenticateWithCredential(auth.currentUser, credential);
		} else if (hasGoogle && !hasPass) {
			// Google-only account
			await _performGoogleReAuth(originalUserId, originalUserEmail);
		} else {
			// No authentication method available
			throw { code: "auth/no-auth-method", message: "No authentication method available for this account" };
		}
	}

	// Perform Google re-authentication
	async function _performGoogleReAuth(originalUserId, originalUserEmail) {
		try {
			// Primary: Safe re-authentication without session switching
			const result = await reauthenticateWithPopup(auth.currentUser, googleProvider);
			_verifyAccountMatch(result.user, originalUserId, originalUserEmail);
		} catch (error) {
			// Fallback: Manual verification with immediate logout on mismatch
			await _handleGoogleReAuthFallback(originalUserId, originalUserEmail, error);
		}
	}

	// Handle Google re-authentication fallback
	async function _handleGoogleReAuthFallback(originalUserId, originalUserEmail, primaryError) {
		const fallbackCodes = [
			"auth/operation-not-supported-in-this-environment",
			"auth/invalid-credential",
			"auth/operation-not-allowed",
		];

		if (!fallbackCodes.includes(primaryError.code)) {
			throw primaryError;
		}

		const result = await signInWithPopup(auth, googleProvider);

		// Critical security check
		if (result.user.uid !== originalUserId || result.user.email !== originalUserEmail) {
			await signOut(auth); // Immediately sign out wrong account
			throw {
				code: "auth/user-mismatch",
				message: `Account mismatch! Expected '${originalUserEmail}' but got '${result.user.email}'. You've been signed out for security.`,
				requiresRelogin: true,
			};
		}
	}

	// Verify account matches original
	function _verifyAccountMatch(user, originalUserId, originalUserEmail) {
		if (user.uid !== originalUserId || user.email !== originalUserEmail) {
			throw {
				code: "auth/user-mismatch",
				message: `Account verification failed. Expected '${originalUserEmail}' but got '${user.email}'.`,
			};
		}
	}

	// Execute comprehensive data deletion with batch management
	async function _executeComprehensiveDataDeletion(userId, userEmail) {
		const batchManager = _createBatchManager();

		// Delete user data in organized steps
		await _deleteUserCollections(userId, batchManager);
		await _cleanupCrossUserReferences(userId, userEmail, batchManager);
		await _deleteUserDocuments(userId, batchManager);

		// Commit all batches
		await _commitBatches(batchManager);
	}

	// Create batch management system
	function _createBatchManager() {
		const batches = [];
		let currentBatch = writeBatch(db);
		let operationCount = 0;

		return {
			add: (operation) => {
				if (operationCount >= 450) {
					batches.push(currentBatch);
					currentBatch = writeBatch(db);
					operationCount = 0;
				}
				operation(currentBatch);
				operationCount++;
			},
			finalize: () => {
				if (operationCount > 0) {
					batches.push(currentBatch);
				}
				return batches;
			},
		};
	}

	// Delete user's own collections
	async function _deleteUserCollections(userId, batchManager) {
		const collections = [
			["users", userId, "profiles"],
			["users", userId, "sharedProfiles"],
			["userShares", userId, "outgoing"],
			["userShares", userId, "incoming"],
		];

		for (const collectionPath of collections) {
			const snapshot = await getDocs(collection(db, ...collectionPath));
			snapshot.docs.forEach((doc) => batchManager.add((batch) => batch.delete(doc.ref)));
		}
	}

	// Clean up cross-user references
	async function _cleanupCrossUserReferences(userId, userEmail, batchManager) {
		await Promise.all([
			_cleanupCollaborativeProfilesEnhanced(batchManager.add, userId),
			_cleanupUserReferencesInSharesEnhanced(batchManager.add, userId, userEmail),
			_cleanupLegacySharedProfilesEnhanced(batchManager.add, userId, userEmail),
		]);
	}

	// Delete user documents
	async function _deleteUserDocuments(userId, batchManager) {
		batchManager.add((batch) => batch.delete(doc(db, "userShares", userId)));
		batchManager.add((batch) => batch.delete(doc(db, "users", userId)));
	}

	// Commit all batches sequentially
	async function _commitBatches(batchManager) {
		const batches = batchManager.finalize();
		console.log(`Committing ${batches.length} batch(es)...`);

		for (let i = 0; i < batches.length; i++) {
			try {
				await batches[i].commit();
			} catch (error) {
				console.error(`Batch ${i + 1} commit failed:`, error);
			}
		}
	}

	// Handle deletion errors
	function _handleDeletionError(error) {
		const errorMap = {
			"auth/requires-password": { error: "Password required for account deletion", requiresPassword: true },
			"auth/wrong-password": { error: "Incorrect password. Please try again." },
			"auth/popup-closed-by-user": { error: "Authentication cancelled. Please try again." },
			"auth/user-mismatch": {
				error: "User mismatch. Please try again. Please select the correct Google account for deletion.",
				requiresRelogin: error.requiresRelogin,
			},
			"auth/requires-recent-login": { error: "Please log out and log back in before deleting your account" },
			"auth/network-request-failed": { error: "Network error. Please check your connection and try again." },
			"auth/no-auth-method": {
				error: "No authentication method available for this account. Please contact support.",
			},
		};

		return {
			success: false,
			...(errorMap[error.code] || { error: error.message || "Failed to delete account data" }),
		};
	}

	// Enhanced Helper: Clean up collaborative profiles on account deletion
	async function _cleanupCollaborativeProfilesEnhanced(addToBatch, userId) {
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
					addToBatch((batch) => batch.delete(doc(collaborativeProfilesRef, profileId)));
				} else if (profileData.collaborators && profileData.collaborators.includes(userId)) {
					// User is a collaborator - remove them from the collaborative profile
					addToBatch((batch) =>
						batch.update(doc(collaborativeProfilesRef, profileId), {
							collaborators: arrayRemove(userId),
							[`permissions.${userId}`]: null,
							lastModified: serverTimestamp(),
						})
					);
				}
			});
		} catch (error) {
			console.error("Error cleaning up collaborative profiles:", error);
			// Don't throw error - allow deletion to continue
		}
	}

	// Legacy Helper: Clean up collaborative profiles on account deletion (kept for compatibility)
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

	// Enhanced Helper: Clean up all user references in other users' shares
	async function _cleanupUserReferencesInSharesEnhanced(addToBatch, userId, userEmail) {
		try {
			// Get all users to check their shares
			const usersRef = collection(db, "users");
			const allUsers = await getDocs(usersRef);

			// Process each user's shares
			for (const userDoc of allUsers.docs) {
				const otherUserId = userDoc.id;

				// Skip the user being deleted
				if (otherUserId === userId) continue;

				// Clean up outgoing shares where this user was the target (by userId)
				const outgoingSharesRef = collection(db, "userShares", otherUserId, "outgoing");
				const outgoingQuery = query(outgoingSharesRef, where("targetUserId", "==", userId));
				const outgoingSnapshot = await getDocs(outgoingQuery);

				outgoingSnapshot.docs.forEach((doc) => {
					addToBatch((batch) => batch.delete(doc.ref));
				});

				// Clean up outgoing shares where this user was the target (by email)
				if (userEmail) {
					const outgoingEmailQuery = query(outgoingSharesRef, where("targetUserEmail", "==", userEmail));
					const outgoingEmailSnapshot = await getDocs(outgoingEmailQuery);

					outgoingEmailSnapshot.docs.forEach((doc) => {
						addToBatch((batch) => batch.delete(doc.ref));
					});
				}

				// Clean up incoming shares where this user was the owner
				const incomingSharesRef = collection(db, "userShares", otherUserId, "incoming");
				const incomingQuery = query(incomingSharesRef, where("ownerUserId", "==", userId));
				const incomingSnapshot = await getDocs(incomingQuery);

				incomingSnapshot.docs.forEach((doc) => {
					addToBatch((batch) => batch.delete(doc.ref));
				});
			}
		} catch (error) {
			console.error("Error cleaning up user references in shares:", error);
			// Don't throw error - allow deletion to continue
		}
	}

	// Legacy Helper: Clean up all user references in other users' shares (kept for compatibility)
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

	// Enhanced Helper: Clean up legacy shared profiles
	async function _cleanupLegacySharedProfilesEnhanced(addToBatch, userId, userEmail) {
		try {
			const sharedProfilesRef = collection(db, "sharedProfiles");

			// Clean up legacy shared profiles where this user is the original owner (by userId)
			const sharedQuery = query(sharedProfilesRef, where("originalUserId", "==", userId));
			const sharedSnapshot = await getDocs(sharedQuery);

			sharedSnapshot.docs.forEach((doc) => {
				addToBatch((batch) => batch.delete(doc.ref));
			});

			// Also clean up by email if available (some old shares might use email)
			if (userEmail) {
				try {
					const emailQuery = query(sharedProfilesRef, where("originalUserEmail", "==", userEmail));
					const emailSnapshot = await getDocs(emailQuery);

					emailSnapshot.docs.forEach((doc) => {
						addToBatch((batch) => batch.delete(doc.ref));
					});
				} catch (emailError) {
					// Field might not exist in all documents, continue anyway
					console.log("Email-based cleanup not needed or failed:", emailError.message);
				}
			}

			// Clean up any shared profiles where this user appears in sharing permissions or access lists
			try {
				const allSharedProfiles = await getDocs(sharedProfilesRef);
				allSharedProfiles.docs.forEach((doc) => {
					const data = doc.data();

					// Check if user appears in any sharing-related fields
					const shouldDelete =
						(data.sharedWith && data.sharedWith.includes(userId)) ||
						(data.sharedWithEmails && userEmail && data.sharedWithEmails.includes(userEmail)) ||
						(data.collaborators && data.collaborators.includes(userId)) ||
						(data.permissions && data.permissions[userId]);

					if (shouldDelete) {
						addToBatch((batch) => batch.delete(doc.ref));
					}
				});
			} catch (allProfilesError) {
				console.error("Error cleaning up shared profiles by user references:", allProfilesError);
			}
		} catch (error) {
			console.error("Error cleaning up legacy shared profiles:", error);
			// Don't throw error - allow deletion to continue
		}
	}

	// Legacy Helper: Clean up legacy shared profiles (kept for compatibility)
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

	// App-wide loading component
	const AppLoading = () => (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
			<div className="text-center">
				<div className="w-16 h-16 mx-auto mb-4 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
				<h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
					Loading Bhemu Calculator
				</h2>
				<p className="text-gray-500 dark:text-gray-400">Initializing your experience...</p>
			</div>
		</div>
	);

	return <AuthContext.Provider value={value}>{loading ? <AppLoading /> : children}</AuthContext.Provider>;
}
