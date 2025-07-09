import {
	collection,
	doc,
	getDoc,
	getDocs,
	setDoc,
	query,
	where,
	orderBy,
	limit,
	serverTimestamp,
	writeBatch,
	onSnapshot,
	arrayUnion,
	arrayRemove,
} from "firebase/firestore";
import { db } from "./config";

// Enhanced Database structure:
// users/{userId}/profiles/{profileId} - user's private profiles
// userShares/{userId}/outgoing/{shareId} - profiles shared by user
// userShares/{userId}/incoming/{shareId} - profiles shared with user
// collaborativeProfiles/{profileId} - profiles with edit permissions for real-time sync
// sharedProfiles/{shareId} - publicly shared profiles (legacy)

export class GPAService {
	constructor(userId) {
		this.userId = userId;
		this.userProfilesRef = collection(db, "users", userId, "profiles");
		this.sharedProfilesRef = collection(db, "sharedProfiles");
		this.userSharedRef = collection(db, "users", userId, "sharedProfiles");

		// Enhanced sharing collections
		// Note: userShares/{userId} is a document reference (2 segments), not a collection reference
		this.outgoingSharesRef = collection(db, "userShares", userId, "outgoing");
		this.incomingSharesRef = collection(db, "userShares", userId, "incoming");
		this.collaborativeProfilesRef = collection(db, "collaborativeProfiles");
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
			const batch = writeBatch(db);
			const id = profileId.toString();

			// Delete main profile
			batch.delete(doc(this.userProfilesRef, id));

			// Clean up all related data
			await Promise.all([
				this._cleanupOutgoingShares(batch, id),
				this._cleanupCollaborativeProfile(batch, id),
				this._cleanupLegacyShares(batch, id),
			]);

			await batch.commit();
			return { success: true };
		} catch (error) {
			console.error("Error deleting profile:", error);
			return { success: false, error: error.message };
		}
	}

	// Helper: Clean up outgoing shares
	async _cleanupOutgoingShares(batch, profileId) {
		const sharesQuery = query(this.outgoingSharesRef, where("profileId", "==", profileId));
		const sharesSnapshot = await getDocs(sharesQuery);

		sharesSnapshot.docs.forEach((shareDoc) => {
			const { targetUserId } = shareDoc.data();
			const shareId = shareDoc.id;

			// Remove from both outgoing and incoming
			batch.delete(doc(this.outgoingSharesRef, shareId));
			batch.delete(doc(db, "userShares", targetUserId, "incoming", shareId));
		});
	}

	// Helper: Clean up collaborative profile
	async _cleanupCollaborativeProfile(batch, profileId) {
		const collaborativeRef = doc(this.collaborativeProfilesRef, profileId);
		const collaborativeSnap = await getDoc(collaborativeRef);

		if (collaborativeSnap.exists()) {
			batch.delete(collaborativeRef);
		}
	}

	// Helper: Clean up legacy shared profiles
	async _cleanupLegacyShares(batch, profileId) {
		const legacyQuery = query(this.userSharedRef, where("profileId", "==", profileId));
		const legacySnapshot = await getDocs(legacyQuery);

		legacySnapshot.docs.forEach((shareDoc) => {
			const shareId = shareDoc.id;

			// Remove from both user and public collections
			batch.delete(doc(this.userSharedRef, shareId));
			batch.delete(doc(this.sharedProfilesRef, shareId));
		});
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

	// ===== ENHANCED USER-SPECIFIC SHARING =====

	async shareProfileWithUser(profileId, targetUserEmail, permission = "read") {
		try {
			// Validate inputs and get required data
			const [profileResult, targetUserId] = await Promise.all([
				this.getProfile(profileId),
				this.getUserIdByEmail(targetUserEmail),
			]);

			if (!profileResult.success) return { success: false, error: "Profile not found" };
			if (!targetUserId) return { success: false, error: "User not found" };

			const shareId = this.generateShareId();
			const shareData = this._createShareData(
				shareId,
				profileId,
				profileResult.profile.name,
				targetUserId,
				targetUserEmail,
				permission
			);

			// Execute sharing operation
			await this._executeShareOperation(shareData, profileResult.profile, permission);

			return { success: true, shareId, shareData };
		} catch (error) {
			console.error("Error sharing profile with user:", error);
			return { success: false, error: error.message };
		}
	}

	// Helper: Create share data object
	_createShareData(shareId, profileId, profileName, targetUserId, targetUserEmail, permission) {
		return {
			shareId,
			profileId,
			profileName,
			ownerUserId: this.userId,
			targetUserId,
			targetUserEmail,
			permission,
			sharedAt: serverTimestamp(),
			isActive: true,
		};
	}

	// Helper: Execute sharing operation with batch
	async _executeShareOperation(shareData, profile, permission) {
		const batch = writeBatch(db);
		const { shareId, profileId, targetUserId } = shareData;

		// Add to both outgoing and incoming shares
		batch.set(doc(this.outgoingSharesRef, shareId), shareData);
		batch.set(doc(db, "userShares", targetUserId, "incoming", shareId), shareData);

		// Create collaborative profile for edit permission
		if (permission === "edit") {
			batch.set(doc(this.collaborativeProfilesRef, profileId), {
				...profile,
				collaborators: arrayUnion(targetUserId),
				permissions: {
					[this.userId]: "owner",
					[targetUserId]: "edit",
				},
				lastModified: serverTimestamp(),
			});
		}

		await batch.commit();
	}

	async getSharedWithMeProfiles() {
		try {
			const snapshot = await getDocs(query(this.incomingSharesRef, where("isActive", "==", true)));
			const sharePromises = snapshot.docs.map((docSnap) => this._buildSharedProfile(docSnap.data()));
			const sharedProfiles = (await Promise.all(sharePromises)).filter(Boolean);

			return { success: true, sharedProfiles };
		} catch (error) {
			console.error("Error fetching shared profiles:", error);
			return { success: false, error: error.message, sharedProfiles: [] };
		}
	}

	// Helper: Build shared profile from share data
	async _buildSharedProfile(shareData) {
		const { profileId, shareId, permission, ownerUserId, sharedAt } = shareData;

		const profileData = await this._getProfileDataByPermission(shareData);
		if (!profileData) return null;

		return {
			...profileData,
			id: profileId,
			shareId,
			permission,
			ownerUserId,
			sharedAt,
			isShared: true,
		};
	}

	async getMySharedProfiles() {
		try {
			const snapshot = await getDocs(query(this.outgoingSharesRef, where("isActive", "==", true)));
			const sharedProfiles = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));
			return { success: true, sharedProfiles };
		} catch (error) {
			console.error("Error fetching my shared profiles:", error);
			return { success: false, error: error.message, sharedProfiles: [] };
		}
	}

	async unshareProfileWithUser(shareId) {
		try {
			// Get share data
			const shareSnap = await getDoc(doc(this.outgoingSharesRef, shareId));
			if (!shareSnap.exists()) {
				return { success: false, error: "Share not found" };
			}

			const shareData = shareSnap.data();
			await this._executeUnshareOperation(shareId, shareData);

			return { success: true };
		} catch (error) {
			console.error("Error unsharing profile with user:", error);
			return { success: false, error: error.message };
		}
	}

	// Helper: Execute unshare operation with batch
	async _executeUnshareOperation(shareId, shareData) {
		const batch = writeBatch(db);
		const { targetUserId, profileId, permission } = shareData;

		// Remove from both outgoing and incoming shares
		batch.delete(doc(this.outgoingSharesRef, shareId));
		batch.delete(doc(db, "userShares", targetUserId, "incoming", shareId));

		// Update collaborative profile for edit permission
		if (permission === "edit") {
			batch.update(doc(this.collaborativeProfilesRef, profileId), {
				collaborators: arrayRemove(targetUserId),
				[`permissions.${targetUserId}`]: null,
				lastModified: serverTimestamp(),
			});
		}

		await batch.commit();
	}

	// Update share permission for an existing share
	async updateSharePermission(shareId, newPermission) {
		try {
			// Get share data
			const shareSnap = await getDoc(doc(this.outgoingSharesRef, shareId));
			if (!shareSnap.exists()) {
				return { success: false, error: "Share not found" };
			}

			const shareData = shareSnap.data();
			if (shareData.permission === newPermission) {
				return { success: true }; // No change needed
			}

			// Execute permission update
			const updatedShareData = await this._executePermissionUpdate(shareId, shareData, newPermission);
			return { success: true, shareData: updatedShareData };
		} catch (error) {
			console.error("Error updating share permission:", error);
			return { success: false, error: error.message };
		}
	}

	// Helper: Execute permission update with batch
	async _executePermissionUpdate(shareId, shareData, newPermission) {
		const batch = writeBatch(db);
		const { targetUserId, profileId, permission: oldPermission } = shareData;

		// Update share data in both locations
		const updatedShareData = { ...shareData, permission: newPermission, updatedAt: serverTimestamp() };
		batch.update(doc(this.outgoingSharesRef, shareId), updatedShareData);
		batch.update(doc(db, "userShares", targetUserId, "incoming", shareId), updatedShareData);

		// Handle collaborative profile changes
		await this._updateCollaborativeProfile(batch, profileId, targetUserId, oldPermission, newPermission);

		await batch.commit();
		return updatedShareData;
	}

	// Helper: Update collaborative profile based on permission change
	async _updateCollaborativeProfile(batch, profileId, targetUserId, oldPermission, newPermission) {
		const collaborativeRef = doc(this.collaborativeProfilesRef, profileId);

		if (oldPermission === "edit" && newPermission === "read") {
			// Remove edit access
			batch.update(collaborativeRef, {
				collaborators: arrayRemove(targetUserId),
				[`permissions.${targetUserId}`]: null,
				lastModified: serverTimestamp(),
			});
		} else if (oldPermission === "read" && newPermission === "edit") {
			// Grant edit access
			const originalProfileSnap = await getDoc(doc(this.userProfilesRef, profileId));
			if (!originalProfileSnap.exists()) return;

			const profileData = originalProfileSnap.data();
			const collaborativeSnap = await getDoc(collaborativeRef);

			if (collaborativeSnap.exists()) {
				// Update existing collaborative profile
				batch.update(collaborativeRef, {
					collaborators: arrayUnion(targetUserId),
					[`permissions.${targetUserId}`]: "edit",
					lastModified: serverTimestamp(),
				});
			} else {
				// Create new collaborative profile
				batch.set(collaborativeRef, {
					...profileData,
					collaborators: [targetUserId],
					permissions: {
						[this.userId]: "owner",
						[targetUserId]: "edit",
					},
					lastModified: serverTimestamp(),
				});
			}
		}
	}

	// Save profile with collaboration support
	async saveProfileWithCollaboration(profile) {
		try {
			const profileData = {
				...profile,
				userId: this.userId,
				updatedAt: serverTimestamp(),
				createdAt: profile.createdAt || serverTimestamp(),
			};

			await this._executeSaveWithCollaboration(profile, profileData);
			return { success: true, profile: profileData };
		} catch (error) {
			console.error("Error saving profile with collaboration:", error);
			return { success: false, error: error.message };
		}
	}

	// Helper: Execute save with collaboration
	async _executeSaveWithCollaboration(profile, profileData) {
		const batch = writeBatch(db);
		const profileId = profile.id.toString();

		// Always save to user's profiles
		batch.set(doc(this.userProfilesRef, profileId), profileData);

		// Update collaborative profile if shared with edit permission
		if (profile.isShared && profile.permission === "edit") {
			batch.set(doc(this.collaborativeProfilesRef, profileId), {
				...profileData,
				lastModified: serverTimestamp(),
			});
		}

		await batch.commit();
	}

	// Listen to collaborative profile changes
	onCollaborativeProfileChange(profileId, callback) {
		try {
			const docRef = doc(this.collaborativeProfilesRef, profileId.toString());
			const unsubscribe = onSnapshot(
				docRef,
				(docSnap) => {
					if (docSnap.exists()) {
						const profile = { id: docSnap.id, ...docSnap.data() };
						callback({ success: true, profile });
					} else {
						callback({ success: false, error: "Collaborative profile not found" });
					}
				},
				(error) => {
					console.error("Error listening to collaborative profile:", error);
					callback({ success: false, error: error.message });
				}
			);

			return unsubscribe;
		} catch (error) {
			console.error("Error setting up collaborative profile listener:", error);
			callback({ success: false, error: error.message });
			return () => {};
		}
	}

	// Listen to incoming shares
	onIncomingSharesChange(callback) {
		try {
			const q = query(this.incomingSharesRef, where("isActive", "==", true));
			const unsubscribe = onSnapshot(
				q,
				(snapshot) => {
					const shares = snapshot.docs.map((doc) => ({
						id: doc.id,
						...doc.data(),
					}));
					callback({ success: true, shares });
				},
				(error) => {
					console.error("Error listening to incoming shares:", error);
					callback({ success: false, error: error.message, shares: [] });
				}
			);

			return unsubscribe;
		} catch (error) {
			console.error("Error setting up incoming shares listener:", error);
			callback({ success: false, error: error.message, shares: [] });
			return () => {};
		}
	}

	// Copy shared profile to user's account
	async copySharedProfileToMyAccount(shareId, newProfileName) {
		try {
			// Get and validate share data
			const shareSnap = await getDoc(doc(this.incomingSharesRef, shareId));
			if (!shareSnap.exists()) {
				return { success: false, error: "Share not found" };
			}

			const shareData = shareSnap.data();
			const profileData = await this._getProfileDataByPermission(shareData);

			if (!profileData) {
				return { success: false, error: "Profile data not found" };
			}

			// Create and save new profile
			const newProfile = this._createCopiedProfile(profileData, newProfileName, shareData);
			return await this.saveProfile(newProfile);
		} catch (error) {
			console.error("Error copying shared profile:", error);
			return { success: false, error: error.message };
		}
	}

	// Helper: Get profile data based on permission
	async _getProfileDataByPermission(shareData) {
		const { profileId, permission, ownerUserId } = shareData;

		const profileRef =
			permission === "edit"
				? doc(this.collaborativeProfilesRef, profileId)
				: doc(db, "users", ownerUserId, "profiles", profileId);

		const profileSnap = await getDoc(profileRef);
		return profileSnap.exists() ? profileSnap.data() : null;
	}

	// Helper: Create copied profile object
	_createCopiedProfile(profileData, newProfileName, shareData) {
		return {
			id: Date.now(),
			name: newProfileName || `Copy of ${profileData.name}`,
			semesters: profileData.semesters || [],
			isDefault: false,
			copiedFrom: {
				shareId: shareData.shareId,
				originalUserId: shareData.ownerUserId,
				originalProfileId: shareData.profileId,
				copiedAt: serverTimestamp(),
			},
		};
	}

	// Helper method to get user ID by email with caching
	async getUserIdByEmail(email) {
		try {
			// Check cache first (optional optimization)
			if (this._userIdCache?.has(email)) {
				return this._userIdCache.get(email);
			}

			// Query users collection
			const usersRef = collection(db, "users");
			const q = query(usersRef, where("email", "==", email), limit(1));
			const snapshot = await getDocs(q);

			const userId = snapshot.empty ? null : snapshot.docs[0].id;

			// Cache the result
			if (!this._userIdCache) {
				this._userIdCache = new Map();
			}
			this._userIdCache.set(email, userId);

			return userId;
		} catch (error) {
			console.error("Error getting user ID by email:", error);
			return null;
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
