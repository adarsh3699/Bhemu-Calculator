import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuth } from "../firebase/AuthContext";
import { createGPAService } from "../firebase/gpaService";
import { useMessage } from "../components/common/message/MessageProvider";

export const useGpaData = () => {
	const { currentUser } = useAuth();
	const { showMessage } = useMessage();

	// ===== STATE MANAGEMENT =====
	const [profiles, setProfiles] = useState([]);
	const [activeProfile, setActiveProfile] = useState(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [sharedProfiles, setSharedProfiles] = useState([]);
	const [sharedWithMeProfiles, setSharedWithMeProfiles] = useState([]);
	const [mySharedProfiles, setMySharedProfiles] = useState([]);

	const activeListeners = useRef({}); // Track active subscriptions to prevention re-render loops
	const isInitializingRef = useRef(false);
	const hasInitializedRef = useRef(false);

	// ===== SERVICE CREATION =====
	const gpaService = useMemo(() => {
		return currentUser ? createGPAService(currentUser.uid) : null;
	}, [currentUser]);

	// ===== COMPUTED VALUES =====
	const sortedProfiles = useMemo(() => {
		return [...profiles].sort((a, b) => {
			if (a.isDefault && !b.isDefault) return -1;
			if (!a.isDefault && b.isDefault) return 1;
			return a.name.localeCompare(b.name);
		});
	}, [profiles]);

	const allProfiles = useMemo(() => {
		const combined = [...sortedProfiles, ...sharedWithMeProfiles];
		return combined.sort((a, b) => {
			// Own profiles first, then shared profiles
			if (!a.isShared && b.isShared) return -1;
			if (a.isShared && !b.isShared) return 1;

			// Within same category, sort by default then name
			if (a.isDefault && !b.isDefault) return -1;
			if (!a.isDefault && b.isDefault) return 1;
			return a.name.localeCompare(b.name);
		});
	}, [sortedProfiles, sharedWithMeProfiles]);

	const currentProfile = allProfiles.find((p) => p.id === activeProfile) || allProfiles[0];
	const semesters = useMemo(() => currentProfile?.semesters || [], [currentProfile]);
	const isReadOnlyProfile = currentProfile?.isShared && currentProfile?.permission === "read";

	// ===== UTILITY FUNCTIONS =====
	const generateProfileName = useCallback(() => {
		const userName = currentUser?.displayName || currentUser?.email?.split("@")[0] || "User";
		return `${userName} (Default)`;
	}, [currentUser]);

	// ===== CORE ACTIONS =====
	const saveProfile = useCallback(
		async (profileData) => {
			if (!gpaService || !profileData) return;

			try {
				setSaving(true);

				// Use collaborative save if the profile is shared with edit permissions
				if (profileData.isShared && profileData.permission === "edit") {
					await gpaService.saveProfileWithCollaboration(profileData);
				} else {
					await gpaService.saveProfile(profileData);
				}
			} catch (error) {
				console.error("Error saving profile:", error);
				showMessage("Error saving data. Please try again.", "error");
			} finally {
				setSaving(false);
			}
		},
		[gpaService, showMessage]
	);

	const updateActiveProfile = useCallback((profileId) => {
		setActiveProfile(profileId);
		localStorage.setItem("activeGpaProfile", profileId.toString());
	}, []);

	const createProfile = useCallback(
		async (name) => {
			try {
				const newProfile = {
					id: Date.now(),
					name: name,
					semesters: [
						{
							id: Date.now().toString(),
							name: "Semester 1",
							subjects: [],
						},
					],
					isDefault: false,
				};

				if (gpaService) {
					await gpaService.saveProfile(newProfile);

					// Immediately switch to the new profile
					updateActiveProfile(newProfile.id);

					// Also update localStorage to ensure persistence
					localStorage.setItem("activeGpaProfile", newProfile.id.toString());

					showMessage("Profile created successfully!", "success");
				}
			} catch (error) {
				console.error("Error creating profile:", error);
				showMessage("Error creating profile. Please try again.", "error");
			}
		},
		[gpaService, updateActiveProfile, showMessage]
	);

	const deleteProfile = useCallback(
		async (profileId) => {
			if (profiles.length <= 1) {
				showMessage("Cannot delete the last profile", "warning");
				return;
			}

			const profileToDelete = profiles.find((p) => p.id === profileId);
			if (!profileToDelete) {
				showMessage("Profile not found", "error");
				return;
			}

			if (profileToDelete.isDefault) {
				showMessage("Cannot delete the default profile", "warning");
				return;
			}

			try {
				if (gpaService) {
					await gpaService.deleteProfile(profileId);

					if (activeProfile === profileId) {
						const remainingProfiles = sortedProfiles.filter((profile) => profile.id !== profileId);
						updateActiveProfile(remainingProfiles[0].id);
					}

					showMessage("Profile deleted successfully", "success");
				}
			} catch (error) {
				console.error("Error deleting profile:", error);
				showMessage("Error deleting profile. Please try again.", "error");
			}
		},
		[profiles, sortedProfiles, activeProfile, updateActiveProfile, gpaService, showMessage]
	);

	// ===== SHARED ACTIONS =====
	const shareProfileWithUser = useCallback(
		async (profileToShare, emailOrAction, permission, action = "share") => {
			if (!gpaService || !profileToShare) return;

			try {
				// Handle unshare action
				if (permission === "unshare") {
					const result = await gpaService.unshareProfileWithUser(emailOrAction);
					if (result.success) {
						showMessage("Profile unshared successfully", "success");
						// Refresh shared profiles list
						const mySharedResult = await gpaService.getMySharedProfiles();
						if (mySharedResult.success) {
							setMySharedProfiles(mySharedResult.sharedProfiles);
						}
					} else {
						showMessage(result.error || "Error unsharing profile", "error");
					}
					return;
				}

				// Handle permission update action
				if (action === "updatePermission") {
					const result = await gpaService.updateSharePermission(emailOrAction, permission);
					if (result.success) {
						showMessage(
							`Permission updated to ${permission === "read" ? "Read Only" : "Edit Access"}`,
							"success"
						);
						// Refresh shared profiles list
						const mySharedResult = await gpaService.getMySharedProfiles();
						if (mySharedResult.success) {
							setMySharedProfiles(mySharedResult.sharedProfiles);
						}
					} else {
						showMessage(result.error || "Error updating permission", "error");
						throw new Error(result.error);
					}
					return;
				}

				// Handle share action
				const result = await gpaService.shareProfileWithUser(profileToShare.id, emailOrAction, permission);

				if (result.success) {
					showMessage(`Profile shared with ${emailOrAction} (${permission} access)`, "success");

					// Refresh shared profiles list
					const mySharedResult = await gpaService.getMySharedProfiles();
					if (mySharedResult.success) {
						setMySharedProfiles(mySharedResult.sharedProfiles);
					}
				} else {
					showMessage(result.error || "Error sharing profile", "error");
					throw new Error(result.error);
				}
			} catch (error) {
				console.error("Error in share operation:", error);
				showMessage("Error sharing profile. Please try again.", "error");
				throw error;
			}
		},
		[gpaService, showMessage]
	);

	const unshareProfile = useCallback(
		async (shareId) => {
			if (!gpaService) return;

			try {
				const result = await gpaService.unshareProfile(shareId);
				if (result.success) {
					showMessage("Profile unshared successfully", "success");
				} else {
					showMessage(result.error || "Error unsharing profile", "error");
				}
			} catch (error) {
				console.error("Error unsharing profile:", error);
				showMessage("Error unsharing profile. Please try again.", "error");
			}
		},
		[gpaService, showMessage]
	);

	const copySharedProfile = useCallback(
		async (shareId, profileName) => {
			if (!gpaService) return;

			try {
				const result = await gpaService.copySharedProfileToMyAccount(shareId, `Copy of ${profileName}`);

				if (result.success) {
					showMessage("Profile copied to your account successfully!", "success");
					updateActiveProfile(result.profile.id);
				} else {
					showMessage(result.error || "Error copying profile", "error");
				}
			} catch (error) {
				console.error("Error copying shared profile:", error);
				showMessage("Error copying profile. Please try again.", "error");
			}
		},
		[gpaService, showMessage, updateActiveProfile]
	);

	const verifyUMS = useCallback(
		async (profileId, umsData) => {
			if (!gpaService || !umsData) return;

			try {
				setSaving(true);

				// Find the current profile
				const currentProfileData = profiles.find((profile) => profile.id === profileId);
				if (!currentProfileData) {
					showMessage("Profile not found", "error");
					return;
				}

				// Create updated profile with UMS data
				const updatedProfile = {
					...currentProfileData,
					name: currentProfileData.name, // Keep existing name
					semesters: umsData.semesters,
					studentInfo: umsData.studentInfo,
					allTermIds: umsData.allTermIds,
					umsVerified: true,
					lastUMSSync: umsData.fetchedAt || new Date().toISOString(),
				};

				// Save the updated profile
				await saveProfile(updatedProfile);

				// Update localStorage with allTermIds for future use
				if (umsData.allTermIds) {
					const existingTermIds = JSON.parse(localStorage.getItem("umsTermIds") || "{}");
					const updatedTermIds = {
						...existingTermIds,
						[currentUser.uid]: {
							...umsData.allTermIds,
							lastUpdated: new Date().toISOString(),
							profileId: profileId,
						},
					};
					localStorage.setItem("umsTermIds", JSON.stringify(updatedTermIds));
				}

				showMessage("Profile successfully updated with UMS data!", "success");

				// Update the profiles state immediately to reflect changes
				const updatedProfiles = profiles.map((profile) =>
					profile.id === profileId ? updatedProfile : profile
				);
				localStorage.setItem("gpaProfiles", JSON.stringify(updatedProfiles));
				setProfiles(updatedProfiles);
			} catch (error) {
				console.error("Error updating profile with UMS data:", error);
				showMessage("Error updating profile with UMS data. Please try again.", "error");
			} finally {
				setSaving(false);
			}
		},
		[gpaService, profiles, saveProfile, showMessage, currentUser]
	);

	// ===== DATA UPDATE ACTIONS =====
	const updateSemesters = useCallback(
		async (newSemesters) => {
			// Find profile in ALL profiles (both owned and shared)
			const currentProfileData = allProfiles.find((profile) => profile.id === activeProfile);

			if (currentProfileData) {
				const updatedProfile = { ...currentProfileData, semesters: newSemesters };
				await saveProfile(updatedProfile);

				// Update local state immediately for UI responsiveness
				if (profiles.some((p) => p.id === activeProfile)) {
					// It's an owned profile
					const updatedProfiles = profiles.map((profile) =>
						profile.id === activeProfile ? updatedProfile : profile
					);
					localStorage.setItem("gpaProfiles", JSON.stringify(updatedProfiles));
					setProfiles(updatedProfiles);
				} else if (sharedWithMeProfiles.some((p) => p.id === activeProfile)) {
					// It's a shared profile
					setSharedWithMeProfiles((prev) =>
						prev.map((profile) =>
							profile.id === activeProfile ? { ...profile, semesters: newSemesters } : profile
						)
					);
				}
			}
		},
		[allProfiles, profiles, sharedWithMeProfiles, activeProfile, saveProfile]
	);

	// ===== INITIALIZATION & LISTENERS =====
	useEffect(() => {
		if (!gpaService || !currentUser || hasInitializedRef.current) return;

		// Check if we're already initializing
		if (isInitializingRef.current) {
			console.log("Initialization already in progress, skipping...");
			return;
		}

		setLoading(true);
		isInitializingRef.current = true; // Set flag immediately to prevent re-runs

		let profilesUnsubscribe = null;
		let sharedProfilesUnsubscribe = null;
		let cleanupCollaborativeListeners = null;

		const loadShares = async () => {
			// Parallelize shared profiles loading
			try {
				const [sharedWithMeResult, mySharedResult] = await Promise.all([
					gpaService.getSharedWithMeProfiles(),
					gpaService.getMySharedProfiles(),
				]);

				if (sharedWithMeResult.success) {
					console.log("Shared with me profiles loaded:", sharedWithMeResult.sharedProfiles.length);
					setSharedWithMeProfiles(sharedWithMeResult.sharedProfiles);
				}

				if (mySharedResult.success) {
					console.log("My shared profiles loaded:", mySharedResult.sharedProfiles.length);
					setMySharedProfiles(mySharedResult.sharedProfiles);
				}
			} catch (error) {
				console.error("Error loading shared profiles:", error);
			}
		};

		const initializeData = async () => {
			try {
				// Step 1: Migrate from localStorage if needed
				const migrationResult = await gpaService.migrateFromLocalStorage();
				console.log("Migration completed:", migrationResult.success);

				// Start loading shared profiles in parallel
				loadShares();

				// Step 2: Set up real-time listeners - WE RELY ON THIS FOR DATA
				// This removes the need for explicit fetch and wait loop
				const cleanupRealtime = setupRealtimeListeners();

				// Note: The listener will handle initial data load and default creation
				// so we don't need to explicitly create default here unless we want to be very precise.
				// However, listener is async.

				console.log("Initialization completed successfully");

				// Store cleanup function for collaborative listeners
				return cleanupRealtime;
			} catch (error) {
				console.error("Initialization error:", error);
				showMessage("Error loading your data. Please try again.", "error");
				setLoading(false);
			} finally {
				// Reset initialization flag and mark as complete
				isInitializingRef.current = false;
				hasInitializedRef.current = true;
			}
		};

		const setupRealtimeListeners = () => {
			// Profiles listener
			profilesUnsubscribe = gpaService.onProfilesChange(async (result) => {
				// Async callback
				if (result.success) {
					console.log("Profiles updated:", result.profiles.length);

					let currentProfiles = result.profiles;

					// CHECK: If no profiles, create default here
					if (currentProfiles.length === 0) {
						console.log("No profiles found in listener, creating default...");
						// Create default profile with unique timestamp
						const defaultProfile = {
							id: `default_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Unique ID
							name: generateProfileName(),
							semesters: [
								{
									id: Date.now().toString(),
									name: "Semester 1",
									subjects: [],
								},
							],
							isDefault: true,
							createdAt: new Date(),
						};
						await gpaService.saveProfile(defaultProfile);
						// Listener will fire again with the new profile
						return;
					}

					// Clean profiles (remove any remaining duplicates)
					const cleanProfiles = currentProfiles
						.filter((profile, index, arr) => {
							// Remove duplicates by name - keep first occurrence
							return arr.findIndex((p) => p.name === profile.name) === index;
						})
						.map((profile) => {
							// Ensure all profiles have at least one semester
							const profileWithId = { ...profile, id: profile.id.toString() };
							if (!profileWithId.semesters || profileWithId.semesters.length === 0) {
								profileWithId.semesters = [
									{
										id: Date.now().toString(),
										name: "Semester 1",
										subjects: [],
									},
								];
								// NOT SAVING HERE TO AVOID LOOPS - just local fix for render
								// If we save, listener fires again. Only save if critical.
							}
							return profileWithId;
						});

					setProfiles(cleanProfiles);

					// Smart profile restoration - check localStorage and current state
					setActiveProfile((prev) => {
						const savedActiveProfile = localStorage.getItem("activeGpaProfile");

						// If there's a saved profile that exists in user's profiles, use it
						if (savedActiveProfile && cleanProfiles.find((p) => p.id === savedActiveProfile)) {
							return savedActiveProfile;
						}

						// If current active profile exists in user's profiles, keep it
						if (prev && cleanProfiles.find((p) => p.id === prev)) {
							return prev;
						}

						// Only set to first profile if no active profile exists
						if (!prev && cleanProfiles.length > 0) {
							const firstProfile = cleanProfiles[0];
							localStorage.setItem("activeGpaProfile", firstProfile.id);
							return firstProfile.id;
						}

						return prev;
					});

					localStorage.setItem("gpaProfiles", JSON.stringify(cleanProfiles));
				} else if (result.error) {
					console.error("Error loading profiles:", result.error);
					showMessage("Error loading profiles. Please refresh.", "error");
				}
				setLoading(false);
			});

			// Legacy shared profiles listener (for backward compatibility)
			sharedProfilesUnsubscribe = gpaService.onSharedProfilesChange((result) => {
				if (result.success) {
					setSharedProfiles(result.sharedProfiles);
				}
			});

			// Enhanced sharing listeners
			const incomingSharesUnsubscribe = gpaService.onIncomingSharesChange((result) => {
				if (result.success) {
					console.log("Incoming shares updated:", result.shares.length);
					// loadSharedWithMeProfiles(); // We already loaded initially, this keeps it fresh
					// Ideally we should just reuse the logic.
					gpaService.getSharedWithMeProfiles().then((res) => {
						if (res.success) setSharedWithMeProfiles(res.sharedProfiles);
					});
				}
			});

			// Return cleanup function
			return () => {
				incomingSharesUnsubscribe?.();
			};
		};

		// Load active profile from localStorage
		const savedActiveProfile = localStorage.getItem("activeGpaProfile");
		if (savedActiveProfile) {
			setActiveProfile(savedActiveProfile);
		}

		initializeData().then((cleanup) => {
			cleanupCollaborativeListeners = cleanup;
		});

		return () => {
			profilesUnsubscribe?.();
			sharedProfilesUnsubscribe?.();
			cleanupCollaborativeListeners?.();
		};
	}, [currentUser, gpaService, showMessage, generateProfileName]);

	// Collaborative Listeners Effect
	useEffect(() => {
		if (!currentUser || !gpaService) return;

		// 1. Subscribe to new profiles
		sharedWithMeProfiles.forEach((profile) => {
			// specific listener for real-time updates on content (semesters, etc.)
			// Only subscribe if we don't have one yet
			if (profile.permission === "edit" && !activeListeners.current[profile.id]) {
				const ownerId = profile.ownerUserId || profile.userId;

				const unsubscribe = gpaService.onCollaborativeProfileChange(profile.id, ownerId, (result) => {
					if (result.success) {
						setSharedWithMeProfiles((prev) => {
							const index = prev.findIndex((p) => p.id === profile.id);
							if (index === -1) return prev; // Profile removed from list

							const oldProfile = prev[index];

							// Loop Prevention: key step.
							const newTime = result.profile.lastModified?.toMillis
								? result.profile.lastModified.toMillis()
								: result.profile.lastModified;
							const oldTime = oldProfile.lastModified?.toMillis
								? oldProfile.lastModified.toMillis()
								: oldProfile.lastModified;

							if (newTime && oldTime && newTime === oldTime) {
								return prev;
							}

							const newProfiles = [...prev];
							newProfiles[index] = {
								...result.profile,
								isShared: true,
								permission: "edit",
								ownerUserId: ownerId,
							};
							return newProfiles;
						});
					}
				});
				// Store unsubscribe
				activeListeners.current[profile.id] = unsubscribe;
			}
		});

		// 2. Unsubscribe from removed profiles
		const currentIds = new Set(sharedWithMeProfiles.map((p) => p.id));
		Object.keys(activeListeners.current).forEach((id) => {
			if (!currentIds.has(id)) {
				// Profile is no longer shared with us or was removed
				if (typeof activeListeners.current[id] === "function") {
					activeListeners.current[id]();
				}
				delete activeListeners.current[id];
			}
		});
	}, [sharedWithMeProfiles, currentUser, gpaService]);

	// Cleanup all listeners on unmount
	useEffect(() => {
		return () => {
			Object.values(activeListeners.current).forEach((unsub) => {
				if (typeof unsub === "function") unsub();
			});
			activeListeners.current = {};
		};
	}, []);

	// Restore active profile when shared profiles are loaded
	useEffect(() => {
		const savedActiveProfile = localStorage.getItem("activeGpaProfile");
		if (savedActiveProfile && sharedWithMeProfiles.find((p) => p.id === savedActiveProfile)) {
			setActiveProfile(savedActiveProfile);
		}
	}, [sharedWithMeProfiles]);

	return {
		profiles,
		activeProfile,
		loading,
		saving,
		sharedProfiles,
		sharedWithMeProfiles,
		mySharedProfiles,
		allProfiles,
		currentProfile,
		semesters,
		isReadOnlyProfile,
		sortedProfiles,

		updateActiveProfile,
		createProfile,
		deleteProfile,
		saveProfile,
		updateSemesters,
		shareProfileWithUser,
		unshareProfile,
		copySharedProfile,
		verifyUMS,
	};
};
