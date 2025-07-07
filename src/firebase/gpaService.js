import {
	collection,
	doc,
	getDoc,
	getDocs,
	setDoc,
	updateDoc,
	deleteDoc,
	query,
	where,
	orderBy,
	limit,
	serverTimestamp,
	writeBatch,
	onSnapshot,
} from "firebase/firestore";
import { db } from "./config";

// Database structure:
// users/{userId}/profiles/{profileId} - user's private profiles
// sharedProfiles/{shareId} - publicly shared profiles
// users/{userId}/sharedProfiles/{shareId} - user's shared profile references

export class GPAService {
	constructor(userId) {
		this.userId = userId;
		this.userProfilesRef = collection(db, "users", userId, "profiles");
		this.sharedProfilesRef = collection(db, "sharedProfiles");
		this.userSharedRef = collection(db, "users", userId, "sharedProfiles");
	}

	// ===== PROFILE MANAGEMENT =====

	async saveProfile(profile) {
		try {
			const profileData = {
				...profile,
				userId: this.userId,
				updatedAt: serverTimestamp(),
				createdAt: profile.createdAt || serverTimestamp(),
			};

			await setDoc(doc(this.userProfilesRef, profile.id.toString()), profileData);
			return { success: true, profile: profileData };
		} catch (error) {
			console.error("Error saving profile:", error);
			return { success: false, error: error.message };
		}
	}

	async getProfiles() {
		try {
			const snapshot = await getDocs(query(this.userProfilesRef, orderBy("createdAt", "desc")));
			const profiles = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));

			// Sort profiles: Default first, then alphabetical
			const sortedProfiles = profiles.sort((a, b) => {
				if (a.isDefault && !b.isDefault) return -1;
				if (!a.isDefault && b.isDefault) return 1;
				return a.name.localeCompare(b.name);
			});

			return { success: true, profiles: sortedProfiles };
		} catch (error) {
			console.error("Error fetching profiles:", error);
			return { success: false, error: error.message, profiles: [] };
		}
	}

	async getProfile(profileId) {
		try {
			const docRef = doc(this.userProfilesRef, profileId.toString());
			const docSnap = await getDoc(docRef);

			if (docSnap.exists()) {
				return { success: true, profile: { id: docSnap.id, ...docSnap.data() } };
			} else {
				return { success: false, error: "Profile not found" };
			}
		} catch (error) {
			console.error("Error fetching profile:", error);
			return { success: false, error: error.message };
		}
	}

	async deleteProfile(profileId) {
		try {
			await deleteDoc(doc(this.userProfilesRef, profileId.toString()));
			return { success: true };
		} catch (error) {
			console.error("Error deleting profile:", error);
			return { success: false, error: error.message };
		}
	}

	// ===== REAL-TIME LISTENERS =====

	// Listen to all profiles for real-time updates
	onProfilesChange(callback) {
		try {
			const q = query(this.userProfilesRef, orderBy("createdAt", "desc"));
			const unsubscribe = onSnapshot(
				q,
				(snapshot) => {
					const profiles = snapshot.docs.map((doc) => ({
						id: doc.id,
						...doc.data(),
					}));

					// Sort profiles: Default first, then alphabetical
					const sortedProfiles = profiles.sort((a, b) => {
						if (a.isDefault && !b.isDefault) return -1;
						if (!a.isDefault && b.isDefault) return 1;
						return a.name.localeCompare(b.name);
					});

					callback({ success: true, profiles: sortedProfiles });
				},
				(error) => {
					console.error("Error listening to profiles:", error);
					callback({ success: false, error: error.message, profiles: [] });
				}
			);

			return unsubscribe;
		} catch (error) {
			console.error("Error setting up profiles listener:", error);
			callback({ success: false, error: error.message, profiles: [] });
			return () => {}; // Return empty unsubscribe function
		}
	}

	// Listen to a specific profile for real-time updates
	onProfileChange(profileId, callback) {
		try {
			const docRef = doc(this.userProfilesRef, profileId.toString());
			const unsubscribe = onSnapshot(
				docRef,
				(docSnap) => {
					if (docSnap.exists()) {
						const profile = { id: docSnap.id, ...docSnap.data() };
						callback({ success: true, profile });
					} else {
						callback({ success: false, error: "Profile not found" });
					}
				},
				(error) => {
					console.error("Error listening to profile:", error);
					callback({ success: false, error: error.message });
				}
			);

			return unsubscribe;
		} catch (error) {
			console.error("Error setting up profile listener:", error);
			callback({ success: false, error: error.message });
			return () => {}; // Return empty unsubscribe function
		}
	}

	// Listen to shared profiles for real-time updates
	onSharedProfilesChange(callback) {
		try {
			const q = query(this.userSharedRef, orderBy("sharedAt", "desc"));
			const unsubscribe = onSnapshot(
				q,
				(snapshot) => {
					const sharedProfiles = snapshot.docs.map((doc) => ({
						id: doc.id,
						...doc.data(),
					}));
					callback({ success: true, sharedProfiles });
				},
				(error) => {
					console.error("Error listening to shared profiles:", error);
					callback({ success: false, error: error.message, sharedProfiles: [] });
				}
			);

			return unsubscribe;
		} catch (error) {
			console.error("Error setting up shared profiles listener:", error);
			callback({ success: false, error: error.message, sharedProfiles: [] });
			return () => {}; // Return empty unsubscribe function
		}
	}

	// ===== SHARING FUNCTIONALITY =====

	async shareProfile(profileId, shareOptions = {}) {
		try {
			// Get the profile first
			const profileResult = await this.getProfile(profileId);
			if (!profileResult.success) {
				return { success: false, error: "Profile not found" };
			}

			const profile = profileResult.profile;
			const shareId = this.generateShareId();

			// Create shared profile
			const sharedProfileData = {
				...profile,
				shareId,
				originalUserId: this.userId,
				originalProfileId: profileId,
				sharedAt: serverTimestamp(),
				isPublic: true,
				shareOptions: {
					allowCopy: shareOptions.allowCopy !== false, // default true
					allowView: shareOptions.allowView !== false, // default true
					expiresAt: shareOptions.expiresAt || null,
					password: shareOptions.password || null,
					...shareOptions,
				},
			};

			const batch = writeBatch(db);

			// Add to shared profiles collection
			const sharedProfileRef = doc(this.sharedProfilesRef, shareId);
			batch.set(sharedProfileRef, sharedProfileData);

			// Add reference to user's shared profiles
			const userSharedRef = doc(this.userSharedRef, shareId);
			batch.set(userSharedRef, {
				shareId,
				profileId,
				profileName: profile.name,
				sharedAt: serverTimestamp(),
				shareUrl: this.generateShareUrl(shareId),
				isActive: true,
			});

			await batch.commit();

			return {
				success: true,
				shareId,
				shareUrl: this.generateShareUrl(shareId),
				sharedProfile: sharedProfileData,
			};
		} catch (error) {
			console.error("Error sharing profile:", error);
			return { success: false, error: error.message };
		}
	}

	async getSharedProfile(shareId) {
		try {
			const docRef = doc(this.sharedProfilesRef, shareId);
			const docSnap = await getDoc(docRef);

			if (docSnap.exists()) {
				const sharedProfile = docSnap.data();

				// Check if share is still valid
				if (
					sharedProfile.shareOptions?.expiresAt &&
					sharedProfile.shareOptions.expiresAt.toDate() < new Date()
				) {
					return { success: false, error: "Share link has expired" };
				}

				return { success: true, sharedProfile };
			} else {
				return { success: false, error: "Shared profile not found" };
			}
		} catch (error) {
			console.error("Error fetching shared profile:", error);
			return { success: false, error: error.message };
		}
	}

	async copySharedProfile(shareId, newProfileName) {
		try {
			// Get the shared profile
			const sharedResult = await this.getSharedProfile(shareId);
			if (!sharedResult.success) {
				return sharedResult;
			}

			const sharedProfile = sharedResult.sharedProfile;

			// Check if copying is allowed
			if (!sharedProfile.shareOptions?.allowCopy) {
				return { success: false, error: "Copying is not allowed for this profile" };
			}

			// Create new profile from shared data
			const newProfile = {
				id: Date.now(),
				name: newProfileName || `Copy of ${sharedProfile.name}`,
				semesters: sharedProfile.semesters || [],
				copiedFrom: {
					shareId,
					originalUserId: sharedProfile.originalUserId,
					copiedAt: serverTimestamp(),
				},
			};

			// Save the copied profile
			const saveResult = await this.saveProfile(newProfile);
			if (saveResult.success) {
				return { success: true, profile: newProfile };
			} else {
				return saveResult;
			}
		} catch (error) {
			console.error("Error copying shared profile:", error);
			return { success: false, error: error.message };
		}
	}

	async getUserSharedProfiles() {
		try {
			const snapshot = await getDocs(query(this.userSharedRef, orderBy("sharedAt", "desc")));
			const sharedProfiles = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));
			return { success: true, sharedProfiles };
		} catch (error) {
			console.error("Error fetching shared profiles:", error);
			return { success: false, error: error.message, sharedProfiles: [] };
		}
	}

	async unshareProfile(shareId) {
		try {
			const batch = writeBatch(db);

			// Remove from shared profiles collection
			const sharedProfileRef = doc(this.sharedProfilesRef, shareId);
			batch.delete(sharedProfileRef);

			// Remove from user's shared profiles
			const userSharedRef = doc(this.userSharedRef, shareId);
			batch.delete(userSharedRef);

			await batch.commit();
			return { success: true };
		} catch (error) {
			console.error("Error unsharing profile:", error);
			return { success: false, error: error.message };
		}
	}

	// ===== UTILITY METHODS =====

	generateShareId() {
		return Date.now().toString(36) + Math.random().toString(36).substr(2);
	}

	generateShareUrl(shareId) {
		return `${window.location.origin}/shared/${shareId}`;
	}

	// ===== BATCH OPERATIONS =====

	async syncLocalProfiles(localProfiles) {
		try {
			const batch = writeBatch(db);

			localProfiles.forEach((profile) => {
				const profileRef = doc(this.userProfilesRef, profile.id.toString());
				const profileData = {
					...profile,
					userId: this.userId,
					updatedAt: serverTimestamp(),
					createdAt: profile.createdAt || serverTimestamp(),
				};
				batch.set(profileRef, profileData);
			});

			await batch.commit();
			return { success: true };
		} catch (error) {
			console.error("Error syncing profiles:", error);
			return { success: false, error: error.message };
		}
	}

	async migrateFromLocalStorage() {
		try {
			const localProfiles = localStorage.getItem("gpaProfiles");
			if (localProfiles) {
				const profiles = JSON.parse(localProfiles);
				const syncResult = await this.syncLocalProfiles(profiles);
				if (syncResult.success) {
					// Keep local backup for now, don't clear immediately
					localStorage.setItem("gpaProfiles", localProfiles);
				}
				return syncResult;
			}
			return { success: true };
		} catch (error) {
			console.error("Error migrating from localStorage:", error);
			return { success: false, error: error.message };
		}
	}
}

// Factory function to create service instance
export const createGPAService = (userId) => {
	if (!userId) {
		throw new Error("User ID is required to create GPA service");
	}
	return new GPAService(userId);
};

// Utility function to check if user is authenticated
export const requireAuth = (currentUser) => {
	if (!currentUser) {
		throw new Error("Authentication required");
	}
	return true;
};
